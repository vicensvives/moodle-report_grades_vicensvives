<?php

require_once('../../config.php');
require_once($CFG->dirroot . '/report/grades_vicensvives/locallib.php');

$courseid = required_param('id', PARAM_INT);
if (!$courseid) {
    throw new moodle_exception('invalidcourseid');
}

require_login($courseid);
$context = context_course::instance($courseid);
require_capability('report/grades_vicensvives:view', $context);

$data = json_encode(report_grades_vicensvives_data($COURSE));
$coursename = s(format_string($COURSE->fullname));

$PAGE->set_pagelayout('embedded');

$strings = array('student', 'topic', 'topics', 'section', 'sections', 'activities');
$PAGE->requires->strings_for_js($strings, 'report_grades_vicensvives');
$PAGE->requires->css('/report/grades_vicensvives/QualificacionsAula.css');

// En Moodle 2.6 Se usa la librería jQuery incluida. En Moodle 2.3 se
// usa la del formato de curso.
if (method_exists($PAGE->requires, 'jquery')) {
    $PAGE->requires->jquery();
} else {
    $PAGE->requires->js('/course/format/vv/jquery.min.js');
}

$PAGE->requires->js('/report/grades_vicensvives/QualificacionsAula.js');
$js = "$('#QualificacionsAula').qualificacionsAula();
       $('#QualificacionsAula').qualificacionsAula('fillStudentsAndTable', $data, '$coursename');";
$PAGE->requires->js_init_code($js, true);

echo $OUTPUT->header();
include('QualificacionsAula.html');
echo $OUTPUT->footer();
