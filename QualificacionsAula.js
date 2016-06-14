(function($) {

    var _lang = "es";
    var _testModelEnabled = false;

    $.fn.qualificacionsAula = function(options) {
        var res;
        if (typeof (options) == "string") {
            var params = Array.prototype.slice.call(arguments, 1);
            res = eval("qualificacionsAula_" + options).apply(this, params);
        } else {
            res = $(this);
            res.data("me", {
                idUser: 0,
                books: [],
                grades: {},
                students: {},
                scholarYearSelected: -1,
                bookSelected: -1,
                unitSelected: -1,
                sectionSelected: -1,
                courseSelected: -1
            });   // plugin object state
            qualificacionsAula_create.call(this, options);
        }
        return res;
    };

    var qualificacionsAula_create = function(options) {
        var self = $(this);

        setData(self, options);
        initComponent(self);
        addListeners(self);
        //fillStudentsAndTable(self, options);
        //decodeHash(self);
        //updateHash(self);
    };

    var qualificacionsAula_fillStudentsAndTable = function(grades, bookTitle) {
        var self = $(this);
        cleanTable(self);
        setBookBreadcrumb(self, bookTitle)
        fillStudentsAndTable(self, grades);
    };
    
    function toggle(self, element) {
        var me = self.data('me');
        if(element.hasClass("hidden")) {
            element.removeClass("hidden");
            element.show();
        }
        else {
            element.addClass("hidden");
            element.hide();
        }
        
        if(element.attr('id') == "llistaLlibres") {
            me.openedLlibres = !self.find('#llistaLlibres').hasClass("hidden");
        }
        if(element.attr('id') == "llistacurs") {
            me.openedCurs = !self.find('#llistacurs').hasClass("hidden");
        }
    }
    
    function addListeners(self) {
        var me = self.data('me');
        self.find("#escullLlibre").click(function(){ 
            self.data('me').clickedLlibres = true;
            toggle(self, self.find('#llistaLlibres'));
            setTimeout(function() {
                self.data('me').clickedLlibres = false;
            }, 100);
        });
        self.find("#escullCurs").click(function(){
            self.data('me').clickedcurs = true;
            toggle(self, self.find("#llistacurs")); 
            setTimeout(function() {
                self.data('me').clickedcurs = false;
            }, 100);
        });
        $(document).click(function() {
            if (self !== undefined && self.data('me') !== undefined) {
                if (self.data('me').openedLlibres && !self.data('me').clickedLlibres) {
                    self.find('#llistaLlibres').addClass("hidden");
                    self.find('#llistaLlibres').hide();
                    self.find('.llibres03').addClass('hidden');
                    self.find('.llibres03').hide();
                    self.data('me').openedLlibres = false;
                }
                if (self.data('me').openedCurs && !self.data('me').clickedcurs) {
                    self.find('#llistacurs').addClass("hidden");
                    self.find('#llistacurs').hide();
                    self.data('me').openedLlibres = false;
                }
            }
        });
    }

    function setData(self, init) {
        if (init) {
            var me = self.data('me');
            if (init.idUser)
                me.idUser = init.idUser;
            me.idCurrentYear = init.idCurrentYear;
            me.courses = init.courses;
            me.books = {};
            if(init.books) {
                for(var i in init.books) {
                    var b = init.books[i];
                    if(me.books[b.idScholarYear] == undefined) {
                        me.books[b.idScholarYear] = {};
                    }
                    me.books[b.idScholarYear][b.idBook] = b;
                }
            }
            if(init.booksPreviousYears) {
                me.booksPreviousYears = init.booksPreviousYears;
                for(var i in init.booksPreviousYears) {
                    var b = init.booksPreviousYears[i];
                    if(me.books[b.idScholarYear] == undefined) {
                        me.books[b.idScholarYear] = {};
                    }
                    me.books[b.idScholarYear][b.idBook] = b;
                }
            }                
            
            me.scholarYears = {};
            for(var i in init.years) {
                var y = init.years[i];
                me.scholarYears[y.idScholarYear] = y;
            }
        }
    }

    function initComponent(self) {
        var me = self.data('me');
        //fillBooksList(self, me.idCurrentYear);
        self.find('#table-1').hide();
        self.find('#waiting').hide();
    }

    function fillBooksList(self, idScholarYear) {
        var me = self.data('me');

        var booksList = self.find('#anyActual');
        booksList.find(".row").remove();
        
        var bks = me.books[idScholarYear];
        for (var i in bks) {
            var opt = $("<li class=\"row\"></li>");
            var s = bks[i].bookTitle;
            opt.attr("value", bks[i].idEnrolment);
            opt.attr("idBook", bks[i].idBook);
            opt.attr("idScholarYear", bks[i].idScholarYear);
            if (s.length > 35) {
                s = s.substring(0, 32) + "...";
            }
            opt.text(s);
            booksList.append(opt);
            opt.on("click", function() {
                var aux = $(this);
                onBookSelected(self, aux.attr("idBook"), aux.attr("idScholarYear"), true);
                me.clickedLlibres = true;
                toggle(self, self.find('#llistaLlibres'));
                setTimeout(function() {
                    me.clickedLlibres = false;
                }, 100);
            });
        }
        
        var template = self.find("#templateAnyAnterior");
        var list = self.find('#anysAnteriors');
        for(var i in me.scholarYears) {
            var y = me.scholarYears[i];
            var ty = template.clone();
            ty.attr('id', y.idScholarYear + "year");
            ty.attr("idScholarYear", y.idScholarYear);
            ty.text(y.years);
            list.append(ty);
            ty.append("<ul class='llibres03 hidden' style='display: none'></ul>")
            ty.on("click",function(){ 
                var aux = $(this);   
                me.clickedLlibres = true;
                toggle(self, aux.children().first());
                setTimeout(function(){
                    me.clickedLlibres = false;
                }, 100);
            });
        }
        var bks = me.booksPreviousYears;
        for(var i in bks) {
            var opt = $("<li class=\"row\"></li>");
            var s = bks[i].bookTitle;
            opt.attr("value", bks[i].idEnrolment);
            
            if (s.length > 35) {
                s = s.substring(0, 32) + "...";
            }
            opt.text(s);
            opt.attr("idBook", bks[i].idBook);
            opt.attr("idScholarYear", bks[i].idScholarYear);
            var year = self.find('#'+bks[i].idScholarYear+"year");
            year.removeClass("hidden");
            year.children().first().append(opt);
            opt.on("click", function() {
                var aux = $(this);
                onBookSelected(self, aux.attr("idBook"), aux.attr("idScholarYear"),true);
                me.clickedLlibres = true;
                toggle(self, self.find('#llistaLlibres'));
                setTimeout(function() {
                    me.clickedLlibres = false;
                }, 100);
            });
        }
    }

    function fillCoursesList(self) {
        var me = self.data('me');

        var coursesList = self.find('#coursesList');
        coursesList.find(".row").remove();
        self.find('#escullCurs').text("~@selecciona_curso@~");
        if (me.bookSelected !== undefined && me.scholarYearSelected != undefined) {
            var courses = me.books[me.scholarYearSelected][me.bookSelected].courses;
            for (var i in courses) {
                var c = courses[i];
                var opt = $("<li class=\"row\"></li>");
                opt.attr("value", i);
                opt.attr("idCourse", c.idCourse);
                opt.text(c.courseName);
                opt.on("click", function() {
                    var idcourse = $(this).attr("idcourse");
                    onCourseSelected(self, idcourse);
                    toggle(self, self.find("#llistacurs")); 
                });
                coursesList.append(opt);
            }
        }

    }

    function cleanTable(self) {
        var aux = self.find("#table-1");
        aux.empty();
        aux.append('<table id="header-fixed" class="headtab"><thead id="headerTable"><tr><th class="alumn">~@alumne@~<div class="quali grey"></div></th></tr></thead><tbody id="bodyTable"></tbody></table>');
        aux.hide();
    }

    function fillGradeTable(self, grades) {
        var me = self.data('me');
        if (grades) {

            var aux = self.find("#table-1");
            aux.empty();
            aux.append('<table id="header-fixed" class="headtab"><thead id="headerTable"><tr><th class="alumn">' + M.str.report_grades_vicensvives.student + '<div class="quali grey"></div></th></tr></thead><tbody id="bodyTable"></tbody></table>');

            var table = aux.find('#header-fixed');

            var columns = table.find('#headerTable > tr');
            columns.find('.headerColumn').remove();

            var head = grades.columns;
            if (me.unitSelected === -1)
                type = "unit";
            else if (me.sectionSelected === -1)
                type = "section";
            else {
                /*head.sort(function(a, b) {
                    if (a.idQuiz != undefined && b.idQuiz != undefined) {
                        var f = a.idQuiz - b.idQuiz;
                        if (f == 0) {
                            if (a.sortorder != undefined && b.sortorder != undefined) {
                                var f2 = a.sortorder - b.sortorder;
                                return f2;
                            }
                        }
                        else
                            return f;
                        return 0;
                    }
                });*/
            }

            var cols = {};

            for (var i in head) {
                var col = head[i];
                cols[col.idCol] = col;
                var type = undefined;
                var name = head[i].nameCol;
                if (me.unitSelected === -1)
                    type = "unit";
                else if (me.sectionSelected === -1)
                    type = "section";
                else {
                    type = "question";
                    //name = parseInt(i) + 1;
                }
                var th = $('<th idCol="' + col.idCol + '" type="' + type + '" class="headerColumn">' + name + '</th>');

                if (type == "question") {
                    th.css("background", "none");
                    th.css("cursor", "auto");
                }
                else {
                    th.css("cursor", "pointer");
                }
                columns.append(th);

            }

            var bodyTable = table.find('#bodyTable');
            bodyTable.html('');

            var userGrades = {};
            for (var i in grades.values) {
                var g = grades.values[i];
                if (userGrades[g.idUser] === undefined) {
                    userGrades[g.idUser] = {};
                }
                userGrades[g.idUser][g.idCol] = g.grade;
            }

            for (var k in me.studentsSorted) {
                var stud = me.studentsSorted[k];
                var i = stud.idUser;
                var quali = "quali medgood";
                var tr = $('<tr class="tdtbody">');
                var tema = 1;
                var acum = 0;
                var n = 0;
                for (var j in cols) {
                    var gr = "";
                    if (userGrades[i] !== undefined) {
                        gr = userGrades[i][j] === undefined ? "" : userGrades[i][j];
                        if (gr) {
                            var aux = Number(gr.replace(",", "."));
                            if (!isNaN(aux)) {
                                acum += aux;
                                ++n;
                            }
                        }
                    }
                    var tdGrade = $('<td tema="' + tema + '">' + gr + '</td>');
                    tdGrade.attr("ida", i);
                    tr.append(tdGrade);
                    ++tema;
                }
                var med = acum / n;
                if (med < 4 || isNaN(med))
                    quali = "quali bad";
                else if (med >= 4 && med < 5)
                    quali = "quali medbad";
                else if (med >= 5 && med < 6)
                    quali = "quali med";
                else if (med >= 6 && med < 8)
                    quali = "quali medgood";
                else if (med >= 8)
                    quali = "quali good";
                //quali = "quali";
                var tdAlumn = $('<td class="alumn"><p>' + me.students[i].name + '</p><div class="' + quali + '"></div></td>');
                tdAlumn.attr("idA", me.students[i].idUser);
                tr.prepend(tdAlumn);
                bodyTable.append(tr);
            }
            self.find('#table-1').show();
            cloneTable(self, head.length);

        }
    }

    function decodeHash(self) {
        /*var me = self.data('me');
        var str = vv.getHash(1);
        var b = new RegExp("b=([0-9]*)");
        var y = new RegExp("y=([0-9]*)");
        var c = new RegExp("c=([0-9]*)");
        var u = new RegExp("u=([0-9]*)");
        var s = new RegExp("s=([0-9]*)");

        var eb = b.exec(str);
        var ey = y.exec(str);
        var ec = c.exec(str);
        var eu = u.exec(str);
        var es = s.exec(str);
        
        if(ec != null) { //A partir del idCourse obtenim llibre i scholar year
            var course = me.courses[ec[1]];
            eb = {1:course.idBook};
            ey = {1:course.idScholarYear};
        }

        if (eb != null && ey != null) {
            me.inibookSelected = eb[1];
            me.iniyearSelected = ey[1];
            onBookSelected(self, eb[1], ey[1], true);
            if (ec != null) {
                me.inicourseSelected = ec[1];
                if (eu != null) {
                    me.iniUnitSelected = eu[1];
                    if (es != null) {
                        me.iniSectionSelected = es[1];
                    }
                }
                self.find('#coursesList').find("option[idcourse='" + ec[1] + "']").attr('selected', 'selected');
                onCourseSelected(self, ec[1]);

            }
        }*/
    }

    function updateHash(self) {
        /*var me = self.data('me');
        if (me.bookSelected != -1 && me.scholarYearSelected) {
            vv.setHash(1,"b=" + me.bookSelected + "&y=" + me.scholarYearSelected);
            if (me.courseSelected != -1) {
                vv.setHash(1,vv.getHash(1) + "&c=" + me.courseSelected);
                if (me.unitSelected != -1) {
                    vv.setHash(1,vv.getHash(1) + "&u=" + me.unitSelected);
                    if (me.sectionSelected != -1) {
                        vv.setHash(1,vv.getHash(1) + "&s=" + me.sectionSelected);
                    }
                }
            }
        }
        else
            vv.setHash("");
        */
    }

    function onCourseSelected(self, idCourse) {
        var me = self.data('me');
        self.find('#bredcrumb').removeClass("hidden");
        self.find('#evaluacio').removeClass("hidden");
        if (me.books[me.scholarYearSelected] && me.books[me.scholarYearSelected][me.bookSelected]) {
            self.find('#escullCurs').text(me.courses[idCourse].courseName);
            me.courseSelected = idCourse;
            updateHash(self);
            callGetGradesByCourse(self, idCourse);
        }
    }

    function setBookBreadcrumb(self, title) {
        //self.find('#escullLlibre').text(vv.cutString(title, 27));
        var me = self.data('me');
        me.unitSelected = -1;
        me.sectionSelected = -1;
        var bredcrumb = self.find('#bredcrumb');
        bredcrumb.empty();
        var bb = $('<p class="bredcrumbPointer" style="text-decoration:none">' + title + '</p>' + '<p class="flech aux">&#62;</p><p class="activ aux">' + M.str.report_grades_vicensvives.topics + '</p>');
        bredcrumb.append(bb);
        bb.on('click', function() {                           
            setBookBreadcrumb(self, title);
            fillGradeTable(self, me.grades);
        });
        bredcrumb.append();
    }

    function onBookSelected(self, idBook, idScholarYear, clean) {
        var me = self.data('me');
        var book = me.books[idScholarYear][idBook];
        if (book) {
            me.bookSelected = idBook;
            me.scholarYearSelected = idScholarYear;
            if (clean == true) {
                me.courseSelected = -1;
                self.find('#bredcrumb').addClass("hidden");
                self.find('#evaluacio').addClass("hidden");
                fillCoursesList(self);
                cleanTable(self);
            }

            if (book.bookTitle !== undefined) {
                self.find('#escullLlibre').text(vv.cutString(book.bookTitle, 27));
                me.unitSelected = -1;
                me.sectionSelected = -1;
                var bredcrumb = self.find('#bredcrumb');
                bredcrumb.empty();
                var bb = $('<p class="bredcrumbPointer" style="text-decoration:none">' + book.bookTitle + '</p>' + '<p class="flech aux">&#62;</p><p class="activ aux">~@temes@~</p>');
                bredcrumb.append(bb);
                bb.on('click', function() {                           
                    onBookSelected(self, idBook, idScholarYear, false);
                    fillGradeTable(self, me.grades);
                });
                bredcrumb.append();
            }
            updateHash(self);
        }
    }

    function onUnitSelected(self, idCol) {
        if (idCol !== undefined) {
            var me = self.data("me");
            var bredcrumb = self.find('#bredcrumb');
            bredcrumb.children().each(function() {
                $(this).removeClass("activ");
            });
            bredcrumb.find('.apart').remove();
            bredcrumb.find('.aux').remove();
            bredcrumb.find('.unitat').remove();
            for (var i in me.grades.columns) {
                var unit = me.grades.columns[i];
                if (unit.idCol == idCol) {
                    me.unitSelected = idCol;
                    me.sectionSelected = -1;
                    var tema = $('<p class="flech unitat">&#62;</p><p class="unitat bredcrumbPointer" style="text-decoration:underline">' + M.str.report_grades_vicensvives.topic + ' ' + unit.nameCol + '</p>' + '<p class="flech unitat aux">&#62;</p><p class="aux activ unitat">' + M.str.report_grades_vicensvives.sections + '</p>');
                    tema.on("click", function() {
                        onUnitSelected(self, idCol);
                    });
                    bredcrumb.append(tema);
                    fillGradeTable(self, unit.sections);
                    break;
                }
            }
        }
        updateHash(self);
    }
    
    function getUnitSelected(self) {
        var me = self.data('me');
        if(me.grades.columns) {
            for(var i in me.grades.columns) {
                var unit = me.grades.columns[i];
                if(unit.idCol == me.unitSelected) {
                    return unit;
                }
            }            
        }
    }
    
    function getSectionSelected(self, unit) {
        var me = self.data('me');
        console.log("unit");
        console.log(unit);
        if(unit.sections.columns) {
            for(var i in unit.sections.columns) {
                var sec = unit.sections.columns[i];
                if(sec.idCol == me.sectionSelected) {
                    return sec;
                }
            }            
        }
    }

    function onSectionSelected(self, idCol) {
        var me = self.data("me");
        if (idCol !== undefined) {
            var bredcrumb = self.find('#bredcrumb');
            bredcrumb.children().each(function() {
                $(this).removeClass("activ");
            });
            bredcrumb.find('.apart').remove();
            bredcrumb.find('.aux').remove();
            var sections = getUnitSelected(self).sections;
            for (var i in sections.columns) {
                var section = sections.columns[i];
                if (section.idCol == idCol) {
                    me.sectionSelected = idCol;
                    var sec = $('<p class="flech apart">&#62;</p><p class="apart">' + M.str.report_grades_vicensvives.section + ' ' + section.nameCol + '</p>' + '<p class="flech apart aux">&#62;</p><p class="activ apart aux">' + M.str.report_grades_vicensvives.activities + '</p>');
                    sec.on("click", function() {
                        onSectionSelected(self, idCol);
                    });
                    bredcrumb.append(sec);
                    fillGradeTable(self, section.questions);
                    break;
                }
            }
        }
        updateHash(self);
    }

    function onQuestionSelected(self, idQ) {
        /*var me = self.data("me");
        var questions = me.grades.columns[me.unitSelected].sections.columns[me.sectionSelected].questions;
        for (var i in questions.columns) {
            var question = questions.columns[i];
            if (question.idCol == idQ) {
                var url = question.url;
                if (url != undefined) {
                    window.location.href = url;
                }
                break;
            }
        }*/
    }

    function cloneTable(self, numCols) {

        $('#bodyTable').find(".quali").each(function() {
            var h = $(this).parent().innerHeight();
            $(this).height(Math.max(h+1, 39));
        });

        $('tr').mouseover(function() {
            $(this).addClass('hover');
        });

        $('tr').mouseout(function() {
            $(this).removeClass('hover');
        });

        $('td').mouseover(function() {
            var tem = $(this).attr('tema');
            var ida = $(this).attr('ida');
            self.find('.ft_cwrapper').find('td[ida="' + ida + '"]').addClass('hover');
            self.find('td[tema="' + tem + '"]').addClass('hover');
            self.find('th[tema="' + tem + '"]').addClass('hover');
        });

        $('td').mouseout(function() {
            var tem = $(this).attr('tema');
            var ida = $(this).attr('ida');
            self.find('.ft_cwrapper').find('td[ida="' + ida + '"]').removeClass('hover');
            self.find('td[tema="' + tem + '"]').removeClass('hover');
            self.find('th[tema="' + tem + '"]').removeClass('hover');
        });

        var cols = [{width: 90, align: 'left'}];
        for (var i = 0; i < numCols; ++i) {
            cols.push({width: 30, align: 'center'});
        }

        var min = window.innerHeight;
        var h = self.find('#table-1').innerHeight() ;
        var w = self.find('#table-1').innerWidth();
        var wheader = self.find('#header-fixed').innerWidth();
        if (h < min)
            min = h;
        self.find("#header-fixed").fxdHdrCol({
            fixedCols: 1,
            width: "100%",
            height: min,
            colModal: cols
        });

        var columns = self.find('#headerTable > tr > th');
        var me = self.data('me');
        columns.each(function() {
            var th = $(this);
            th.on("click", function() {
                var thtype = $(this).attr("type");
                var thidCol = $(this).attr("idCol");
                if (thtype == "unit") {
                    onUnitSelected(self, thidCol);
                }
                else if (thtype == "section") {
                    onSectionSelected(self, thidCol);
                }
                else if (thtype == "question") {
                    onQuestionSelected(self, thidCol);
                }
            });
        });
        var aux = self.find('.ft_cwrapper');
        aux.height(aux.height() + 3);

        var h = self.find('.ft_container').children().first().innerHeight();
        h = Math.min(h, 500);
        self.find('#table-1').children().first().attr("style", "height:" + h +"px");
    }        
    
    function ca(method,params, async) {
        var options = new Object();
        options.method = method;
        options.params = params;
        options.ctl = 'marmite.cmp.qualificacionsAula.QualificacionsAulaCtl';
        options.lang = _lang;
        options.test = _testModelEnabled;       
        if(async != undefined) options.async = async;
        return vv.callModel(options);
        
    }

    function fillStudentsAndTable(self, resp) {
        var me = self.data('me');
        if (resp.units) {
            //me.students = {};
            me.studentsSorted = resp.students;
            for (var i in resp.students) {
                var s = resp.students[i];
                me.students[s.idUser.toString()] = s;
            }
            me.grades = resp.units;
            if (me.iniUnitSelected != undefined) {
                me.unitSelected = me.iniUnitSelected;
                var us = getUnitSelected(self);
                me.iniUnitSelected = undefined;
                onUnitSelected(self, us.idCol);
                if (me.iniSectionSelected != undefined) {
                    me.sectionSelected = me.iniSectionSelected;
                    var ss = getSectionSelected(self, us);
                    me.iniSectionSelected = undefined;
                    onSectionSelected(self, ss.idCol);
                }
            }
            else {
                fillGradeTable(self, resp.units);
            }
        }
    }

    function callGetGradesByCourse(self, idC) {
        var me = self.data('me');
        self.find('#waiting').show();
        var resp = ca("getGradesByBookXClassroom", {idBookXClassroom: idC, idUser: me.idUser, idEnrolment: me.books[me.scholarYearSelected][me.bookSelected].idEnrolment}, true);        
        resp.done(function(resp, textStatus, jqXHR) {
            fillStudentsAndTable(self, resp);
        });

        resp.fail(function(jqXHR, textStatus, errorThrown) { 
            console.log(jqXHR.responseText);
            console.log(textStatus);
            console.log(errorThrown);
        });

        resp.always(function(data, textStatus, errorThrown) {
            self.find('#waiting').hide();
        });
    }
})(jQuery);

/*
 A jQuery plugin to convert a well formatted table into a table with fixed
 rows and columns.
 
 About License:
 Copyright (C) 2013 Selvakumar Arumugam
 You may use attrchange plugin under the terms of the MIT Licese.
 https://github.com/meetselva/fixed-table-rows-cols/blob/master/MIT-License.txt
 */
(function($) {

    $.fn.fxdHdrCol = function(o) {
        var cfg = {
            height: 0,
            width: 0,
            fixedCols: 0,
            colModal: [],
            tableTmpl: function() {
                return '<table />';
            }
        };
        $.extend(cfg, o);

        return this.each(function() {
            var lc = {
                ft_container: null,
                ft_rel_container: null,
                ft_wrapper: null,
                ft_rc: null,
                ft_r: null,
                ft_c: null,
                tableWidth: 0
            };

            var $this = $(this);
            $this.addClass('ui-widget-header');
            $this.find('tbody tr').addClass('ui-widget-content');

            //add base container
            $this.wrap('<div class="ft_container" />');
            lc.ft_container = $this.parent();

            var $ths = $('thead tr', $this).first().find('th');
            var $thFirst = $ths.first();
            var thSpace = parseInt($thFirst.css('paddingLeft'), 10) + parseInt($thFirst.css('paddingRight'), 10) + 4;

            /* set width and textAlign from colModal */
            var ct = 0;
            $ths.each(function(i, el) {
                var calcWidth = 0;
                for (var j = 0; j < el.colSpan; j++) {
                    calcWidth += cfg.colModal[ct].width;
                    ct++;
                }
                $(el).css({width: calcWidth, textAlign: cfg.colModal[ct - 1].align});
                lc.tableWidth += calcWidth + thSpace;
            });

            $this.width(lc.tableWidth);

            $('tbody', $this).find('tr').each(function(i, el) {
                $('td', el).each(function(i, tdel) {
                    tdel.style.textAlign = cfg.colModal[i].align;
                });
            });

            //add relative container
            $this.wrap('<div class="ft_rel_container" />');
            lc.ft_rel_container = $this.parent();

            //set width and height for rel container
            lc.ft_rel_container.css({width: cfg.width, height: cfg.height});

            //add wrapper to base table which will have the scrollbars
            $this.wrap('<div class="ft_scroller" />');
            lc.ft_wrapper = $this.parent();

            var theadTr = $('thead', $this);

            //clone the thead->tr 
            var theadTrClone = theadTr.clone();

            //construct fixed row (full row)
            lc.ft_rel_container
                    .prepend($(cfg.tableTmpl(), {'class': 'ft_r ui-widget-header'})
                            .append(theadTrClone));

            //an instance of fixed row
            lc.ft_r = $('.ft_r', lc.ft_rel_container);
            lc.ft_r.wrap($('<div />', {'class': 'ft_rwrapper'}));

            lc.ft_r.width(lc.tableWidth);

            if (cfg.fixedCols > 0) {
                //clone the thead again to construct the 
                theadTrClone = theadTr.clone();

                //calculate the actual column's count (support for colspan)                 
                var r1c1ColSpan = 0;
                for (var i = 0; i < cfg.fixedCols; i++) {
                    r1c1ColSpan += this.rows[0].cells[i].colSpan;
                }

                //prepare rows/cols for fixed row col section
                var tdct = 0;
                $('tr', theadTrClone).first().find('th').filter(function() {
                    tdct += this.colSpan;
                    return tdct > r1c1ColSpan;
                }).remove();

                //add fixed row col section
                lc.ft_rel_container
                        .prepend($(cfg.tableTmpl(), {'class': 'ft_rc ui-widget-header'})
                                .append(theadTrClone));

                //an instance of fixed row column
                lc.ft_rc = $('.ft_rc', lc.ft_rel_container);

                //now clone the fixed row column and append tbody for the remaining rows
                lc.ft_c = lc.ft_rc.clone();
                lc.ft_c[0].className = 'ft_c';

                //append tbody
                lc.ft_c.append('<tbody />');

                //append row by row while just keeping the frozen cols
                var ftc_tbody = lc.ft_c.find('tbody');
                $.each($this.find('tbody > tr'), function(idx, el) {
                    var tr = $(el).clone();

                    tdct = 0;
                    tr.find('td').filter(function() {
                        tdct += this.colSpan;
                        return tdct > r1c1ColSpan;
                    }).remove();

                    ftc_tbody.append(tr);
                });

                lc.ft_rc.after(lc.ft_c);
                lc.ft_c.wrap($('<div />', {'class': 'ft_cwrapper'}));

                var tw = 0;
                for (var i = 0; i < cfg.fixedCols; i++) {
                    tw += $(this.rows[0].cells[i]).outerWidth(true);
                }
                lc.ft_c.add(lc.ft_rc).width(tw + 1);
                lc.ft_c.height($this.outerHeight(true));

                //set height of fixed_rc and fixed_c
                for (var i = 0; i < this.rows.length; i++) {
                    var ch = $(this.rows[i]).outerHeight();
                    var fch = $(lc.ft_c[0].rows[i]).outerHeight(true);

                    ch = (ch > fch) ? ch : fch;

                    if (i < lc.ft_rc[0].rows.length) {
                        $(lc.ft_r[0].rows[i])
                                .add(lc.ft_rc[0].rows[i])
                                .height(ch);
                    }

                    $(lc.ft_c[0].rows[i])
                            .add(this.rows[i])
                            .height(ch);
                }

                lc.ft_c
                        .parent()
                        .css({height: cfg.height - 17})
                        .width(lc.ft_rc.outerWidth(true) + 1);
            }

            lc.ft_r
                    .parent()
                    .css({width: lc.ft_rel_container.width() - 17});

            //events (scroll and resize)
            lc.ft_wrapper.scroll(function() {
                if (cfg.fixedCols > 0) {
                    lc.ft_c.css('top', ($(this).scrollTop() * -1));
                }
                lc.ft_r.css('left', ($(this).scrollLeft() * -1));
            });

            /*$(window).on('resize', function () {
             lc.ft_r
             .parent()
             .css({width: lc.ft_rel_container.width()- 17});            
             });*/
        });

    };

})(jQuery);
