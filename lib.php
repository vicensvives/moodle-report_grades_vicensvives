<?php

defined('MOODLE_INTERNAL') || die;

/**
 * This function extends the navigation with the report items
 *
 * @param navigation_node $navigation The navigation node to extend
 * @param stdClass $course The course to object for the report
 * @param stdClass $context The context of the course
 */
function report_grades_vicensvives_extend_navigation_course($navigation, $course, $context) {
    if ($course->format != 'vv') {
        return;
    }

    if (!has_capability('report/grades_vicensvives:view', $context)) {
        return;
    }

    $url = new moodle_url('/report/grades_vicensvives/index.php', array('id' => $course->id));
    $title = get_string('grades', 'report_grades_vicensvives');
    $navigation->add($title, $url, navigation_node::TYPE_SETTING, null, null, new pix_icon('i/grades', ''));
}
