<?php

require_once($CFG->libdir.'/gradelib.php');
require_once($CFG->dirroot.'/course/lib.php');


/**
 * Genera los datos que necesita el qualificador de Vicens Vives
 *
 * @param stdClass $course
 * @return array
 */
function report_grades_vicensvives_data($course) {
    global $COURSE;

    $units = report_grades_vicensvives_tree_with_grades($COURSE);
    $users = report_grades_vicensvives_users($COURSE->id);

    $data = array(
        'idCourse' => $COURSE->id,
        'students' => array(),
        'units' => array(
            'columns' => array(),
            'values' => array(),
        ),
    );

    foreach ($users as $userid => $fullname) {
        $data['students'][] = array('idUser' => $userid, 'name' => $fullname);
    }

    foreach ($units as $unitnum => $unit) {
        $unitcol = array(
            'idCol' => $unitnum,
            'nameCol' => $unit['label'],
            'sections' => array(
                'columns' => array(),
                'values' => array(),
            ),
        );

        foreach ($unit['sections'] as $sectionnum => $section) {
            $sectioncol = array(
                'idCol' => $sectionnum,
                'nameCol' => $section['label'],
                'questions' => array(
                    'columns' => array(),
                    'values' => array(),
                ),
            );

            foreach ($section['activities'] as $activitynum => $activity) {
                $sectioncol['questions']['columns'][] = array(
                    'idCol' => $activitynum,
                    'nameCol' => $activity['label'],
                );
                foreach ($activity['grades'] as $userid => $grade) {
                    $sectioncol['questions']['values'][] = array(
                        'idCol' => $activitynum,
                        'idUser' => $userid,
                        'grade' => format_float($grade, 1),
                    );
                }
            }

            $unitcol['sections']['columns'][] = $sectioncol;

            foreach ($section['grades'] as $userid => $grade) {
                $unitcol['sections']['values'][] = array(
                    'idCol' => $sectionnum,
                    'idUser' => $userid,
                    'grade' => format_float($grade, 1),
                );
            }
        }

        foreach ($unit['grades'] as $userid => $grade) {
            $data['units']['values'][] = array(
                'idCol' => $unitnum,
                'idUser' => $userid,
                'grade' => format_float($grade, 1),
            );
        }

        $data['units']['columns'][] = $unitcol;
    }

    return $data;
}

/**
 * Calificaciones del curso, normalizadas a escala 0-10
 * @param array $items
 * @return array (itemid => array(userid => grade))
 */
function report_grades_vicensvives_fetch_grades(array $items) {
    global $DB;

    $grades = array();

    $itemids = array_keys($items);
    foreach ($itemids as $itemid) {
        $grades[$itemid] = array();
    }

    list($itemidsql, $itemidparams) = $DB->get_in_or_equal($itemids);
    $select = 'finalgrade IS NOT NULL AND itemid ' .  $itemidsql;
    $fields = 'id, itemid, userid, finalgrade';
    $rs = $DB->get_recordset_select('grade_grades', $select, $itemidparams, '', $fields);

    foreach ($rs as $record) {
        $item = $items[$record->itemid];
        $grade = grade_grade::standardise_score($record->finalgrade, $item->grademin, $item->grademax, 0, 10);
        $grades[$record->itemid][$record->userid] = $grade;
    }

    $rs->close();

    return $grades;
}

/**
 * Elementos de calificación de las actividades evaluables del curso
 * @param int $courseid
 * @return array grade_item
 */
function report_grades_vicensvives_items($courseid) {
    $params = array('courseid' => $courseid, 'itemtype' => 'mod', 'gradetype' => GRADE_TYPE_VALUE);
    return grade_item::fetch_all($params);
}

/**
 * Árbol de actividades evaluables del curso
 *
 * @param stdClass $course
 * @param array $items grade_item
 * @return array de arrays con:
 *             label => string
 *             sections => array de con:
 *                 label => string
 *                 activities => array de arrays con:
 *                      label => string
 *                      itemid => int
 */
function report_grades_vicensvives_tree($course, $items) {
    $units = array();

    $modinfo = get_fast_modinfo($course);

    $moditems = array();
    foreach ($items as $item) {
        $moditems[$item->itemmodule][$item->iteminstance] = $item;
    }

    foreach ($modinfo->get_section_info_all() as $section) {
        $sections = array();
        $sectionlabel = '';
        $activities = array();
        $activitylabel = 1;

        foreach (explode(',', $section->sequence) as $modid) {
            if (empty($modinfo->cms[$modid])) {
                continue;
            }
            $mod = $modinfo->cms[$modid];
            if ($mod->modname == 'label') {
                if (!preg_match('/^\[(\w)\] /', $mod->name, $match)) {
                    continue;
                }
                if ($activities) {
                    $sections[] = array(
                        'label' => $sectionlabel,
                        'activities' => $activities,
                    );
                    $activities = array();
                }
                $sectionlabel = $match[1];
            } elseif (isset($moditems[$mod->modname][$mod->instance])) {
                $activities[] = array(
                    'label' => $activitylabel,
                    'itemid' => $moditems[$mod->modname][$mod->instance]->id,
                );
                $activitylabel++;
            }
        }

        if ($activities) {
            $sections[] = array(
                'label' => $sectionlabel,
                'activities' => $activities,
            );
        }

        if ($sections) {
            if (preg_match('/^\s*(\w+)\..*/', $section->name, $match)) {
                $label = $match[1];
            } else {
                $label = $section->section;
            }
            $units[] = array(
                'label' => $label,
                'sections' => $sections,
            );
        }
    }

    return $units;
}

/**
 * Árbol de actividades evaluables del curso con las calificaciones de los alumnos
 *
 * @param stdClass $course
 * @return array de arrays con:
 *             label => string
 *             grades => array(userid => grade)
 *             sections => array de con:
 *                 label => string
 *                 grades => array(userid => grade)
 *                 activities => array de arrays con:
 *                     label => string
 *                     item => grade_item
 *                     grades => array(userid => grade)
 */
function report_grades_vicensvives_tree_with_grades($course) {
    $items = report_grades_vicensvives_items($course->id);
    $units = report_grades_vicensvives_tree($course, $items);
    $allgrades = report_grades_vicensvives_fetch_grades($items);

    foreach ($units as &$unit) {
        $unitgrades = array();

        foreach ($unit['sections'] as &$section) {
            $sectiongrades = array();

            foreach ($section['activities'] as &$activity) {
                $activity['grades'] = array();
                foreach ($allgrades[$activity['itemid']] as $userid => $grade) {
                    $activity['grades'][$userid] = $grade;
                    $sectiongrades[$userid][] = $grade;
                    $unitgrades[$userid][] = $grade;
                }
            }

            $section['grades'] = array();
            foreach ($sectiongrades as $userid => $grades) {
                $section['grades'][$userid] = array_sum($grades) / count($grades);
            }
        }

        $unit['grades'] = array();
        foreach ($unitgrades as $userid => $grades) {
            $unit['grades'][$userid] = array_sum($grades) / count($grades);
        }
    }

    return $units;
}

/**
 * Usuarios evaluables del curso
 * @param int $courseid
 * @return array userid => fullname
 */
function report_grades_vicensvives_users($courseid) {
    global $CFG, $DB;

    $users = array();

    if (empty($CFG->gradebookroles)) {
        return $users;
    }

    $context = context_course::instance($courseid);

    list($rolessql, $rolesparams) = $DB->get_in_or_equal(explode(',', $CFG->gradebookroles), SQL_PARAMS_NAMED, 'grbr0');
    list($contextssql, $contextparams) = $DB->get_in_or_equal($context->get_parent_context_ids(true), SQL_PARAMS_NAMED);
    $roleassignmentssql = "SELECT DISTINCT ra.userid
                           FROM {role_assignments} ra
                           WHERE ra.roleid $rolessql
                           AND ra.contextid $contextssql";

    list($enrolledsql, $enrolledparams) = get_enrolled_sql($context);

    $sql = "SELECT u.id, u.firstname, u.lastname
            FROM {user} u
            JOIN ($enrolledsql) je ON je.id = u.id
            JOIN ($roleassignmentssql) jra ON jra.userid = u.id
            WHERE u.deleted = 0
            ORDER BY u.lastname, u.firstname";
    $params = array_merge($rolesparams, $contextparams, $enrolledparams);
    $records = $DB->get_records_sql($sql, $params);

    foreach ($records as $record) {
        $users[$record->id] = $record->lastname . ', ' . $record->firstname;
    }

    return $users;
}
