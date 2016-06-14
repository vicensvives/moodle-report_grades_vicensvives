Informe de calificaciones Vicens Vives (Moodle 2.3, 2.5, 2.6, 2.7 y 2.8)
========================================================================

Plugin de informe para mostrar las calificaciones en los cursos con
formato de curso Vicens Vivves.

Características:

  * Sólo se muestra en los cursos con formato Vicens Vives.
  * Las actividades se agrupan en unidades (secciones de Moodle) y
    apartados (delimitadas con etiquetas).
  * Sólo se muestran actividades con calificación numérica.
  * Las notas se muestran con escala de 0 a 10.
  * Las notas de las unidades y apartados se calculan con una media
    aritmética de las actividades que contienen.
  * La tabla de calificaciones está implementado en el código
    JavaScript y CSS proporcionada por Vicens Vives. Son los ficheros
    QualificacionsAula.js y QualificacionsAula.css. Estos ficheros se
    han modificado para poder mostrar los textos traducidos y corregir
    algunos errores de visualización.
  * La tabla de calificaciones se incrustra en un iframe para evitar
    conflictos de ids y clases en el HTML.
