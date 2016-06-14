<?php

require_once('../../config.php');

$courseid = required_param('id', PARAM_INT);
if (!$courseid) {
    throw new moodle_exception('invalidcourseid');
}

$url = new moodle_url('/report/grades_vicensvives/index.php', array('id' => $courseid));
$PAGE->set_url($url);

require_login($courseid);
$context = context_course::instance($courseid);
require_capability('report/grades_vicensvives:view', $context);

$PAGE->set_title($COURSE->shortname .': '. get_string('grades', 'report_grades_vicensvives'));
$PAGE->set_heading($COURSE->fullname);
$PAGE->set_pagelayout('report');

echo $OUTPUT->header();

$iframeurl = new moodle_url('/report/grades_vicensvives/QualificacionsAula.php', array('id' => $courseid));

$attributes = array(
    'src' => $iframeurl->out(),
    'class' => 'report_grades_vicensvives_iframe',
    'scrolling' => 'no',
);
echo html_writer::tag('iframe', '', $attributes);

echo $OUTPUT->footer();
