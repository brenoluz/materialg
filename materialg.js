(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.materialg = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  'view':     require('./view/index'),
  'validate': require('./validate/index'),
  'plugins':  require('./plugins/index'),
};

},{"./plugins/index":3,"./validate/index":7,"./view/index":14}],2:[function(require,module,exports){
var mgdate = function (element) {
    var self = this;
    var lang = ($(element).data("lang") !== undefined) ? $(element).data("lang") : 'pt';
    console.log(lang)
    $(element).on("click", function () {
        var val = $(this).val();
        $(this).attr('readonly', true);
        var day = '', month = '', year = '';
        var arrayValue = val.split('-')
        var valid = self.validDate(arrayValue[2], arrayValue[1], arrayValue[0])
        if (val === undefined || val === '' || valid === false) {
            var today = new Date();
            day = today.getDate();
            month = today.getMonth() + 1;
            year = today.getFullYear();
        } else {
            day = Number(arrayValue[2]);
            month = Number(arrayValue[1]);
            year = Number(arrayValue[0]);
        }
        self.init($(this), day, month, year, lang);
    });
};

mgdate.prototype.init = function (element, day, month, year, lang) {
    this.element = element;
    this.day = day;
    this.month = month;
    this.year = year;

    this.lang = lang;
    this.nLoadYearsPrev = 150;
    this.nLoadYearsNext = 50;

    this.quickLoad = true;

    this.loadHtml();
    $("#MG_Date_Back").fadeIn("fast");
    this.dayAdjust = 1;
    this.monthAdjust = 1;
    this.yearAdjust = 1;
    this.loadDays();
    this.loadYears();
    elMonth = this.loadMonths();
    elDay = this.loadDays();

    this.setYear(this.year);
    this.setMonth(elMonth);
    this.setDay(elDay);
    this.events();
    this.wait = 50;

};
mgdate.prototype.setDay = function (element) {
    if (element.length > 0) {
        this.jumpToDay(element);
    } else {
        $("#MG_Date_day .scroller").html('');
        var selected = this.loadDays();
        this.jumpToDay(selected);
    }
}
mgdate.prototype.goToDay = function (element, velocity) {

    if (velocity === undefined) {
        velocity = 200;
    }

    var cont = element.parent();
    this.dayAdjust = 0;
    this.day = Number(element.data('day'));
    $("#dSelected").attr('id', '');
    element.attr("id", 'dSelected');
    this.loadDays();
    scrollValue = this.getScrollValueEl(element);
    var self = this;
    cont.animate({scrollTop: scrollValue}, velocity, function () {

        if (element.data('type') === 'f') {
            var realId = "d" + self.day;
            self.jumpToDay(realId);
        }
        setTimeout(function () {
            self.dayAdjust = 1;
        }, self.wait);

    });
};
mgdate.prototype.jumpToDay = function (el) {
    this.day = el.data('day');

    var cont = el.parent();
    var newValue = this.getScrollValueEl(el);

    cont.scrollTop(newValue);
}
mgdate.prototype.getDayHtml = function (day, selected) {

    var div = document.createElement("div");
    $(div).attr("data-day", day);
    if (selected === true) {
        $(div).attr("id", 'dSelected');
    }
    if (day > 28) {
        $(div).attr("class", 'd' + day);
    }
    var nDay = (day < 10) ? '0' + day : day;
    var t = document.createTextNode(nDay);
    div.appendChild(t);

    return $(div);
};
mgdate.prototype.reloadDays = function () {
    var lastDay = this.lastDayMonth(this.year, this.month);
    var dif = lastDay - this.day;
    el = $("#dSelected");
    if (dif < 0) {
        for (var i = 0; i > dif; i--) {
            prev = el.prev();
            el = prev;
        }
    }
    this.goToDay(el);
    $("#MG_Date_day .scroller").html('');
    this.loadDays();
}
mgdate.prototype.loadDays = function () {
    var div = this.getDayHtml(this.day, true);
    if ($("#dSelected").length === 0) {
        $("#MG_Date_day .scroller").append(div);
    }
    var lastDay = this.lastDayMonth(this.year, this.month)
    this.loadPrevDays(lastDay);
    this.loadNextDays(lastDay);

    return $('#dSelected');
};
mgdate.prototype.loadPrevDays = function (lastDay) {

    var selected = $("#dSelected");
    var tDay = this.day - 1;
    var prev = selected.prev();
    for (var i = 0; i < 60; i++) {
        if (tDay === 0) {
            tDay = lastDay;
        }
        var html = this.getDayHtml(tDay);
        if (prev.length === 0) {
            $("#MG_Date_day .scroller").prepend(html);
        } else {
            prev.html(html.html())
        }
        prev = prev.prev();
        --tDay;
    }

    var i2 = 0;
    while (prev.length != 0) {
        if (tDay === 0) {
            tDay = lastDay;
        }
        var tPrev = prev.prev();
        prev.remove();
        prev = tPrev;
        --tDay;
    }

}


mgdate.prototype.loadNextDays = function (lastDay) {

    var selected = $("#dSelected");
    var tDay = this.day + 1;
    var next = selected.next();
    for (var i = 0; i < 60; i++) {
        if (tDay === lastDay + 1) {
            tDay = 1;
        }

        if (next.length === 0) {
            var html = this.getDayHtml(tDay);
            $("#MG_Date_day .scroller").append(html);

        }
        next = next.next();
        ++tDay;
    }

    while (next.length != 0) {
        if (tDay === lastDay + 1) {
            tDay = 1;
        }
        var tNext = next.next();
        next.remove();
        next = tNext;
        ++tDay;
    }

};
mgdate.prototype.infiniteScrollDay = function () {
    var cont = $("#MG_Date_day .scroller");
    var wait = 250;


    if (this.dayAdjust === 1) {
        clearTimeout($.data(this, 'scrollTimer'));
        var self = this;
        $.data(this, 'scrollTimer', setTimeout(function () {
            self.adjustScrollDay();
        }, wait));
    }

};
mgdate.prototype.adjustScrollDay = function () {

    if (this.dayAdjust === 1) {

        var self = this;
        var cel = $("#MG_Date_day .scroller div:nth-child(1)");
        ;
        var halfCelHeight = cel.height() / 2;

        $("#MG_Date_day .scroller div").each(function () {
            //if($(this).css('display') === 'block'){
            if ($(this).position().top > -halfCelHeight) {
                var correct = $(this).next().next();
                self.goToDay(correct, 50)
                return false;

            }
            //}
        });
    }
}
mgdate.prototype.setMonth = function (element) {
    if (element.length > 0) {
        this.jumpToMonth(element);
    } else {
        $("#MG_Date_month .scroller").html('');
        var selected = this.loadMonths();
        this.jumpToMonth(selected);
    }
};
mgdate.prototype.goToMonth = function (element, velocity) {

    var elYear = Number(element.data("year"));

    if (velocity === undefined) {
        velocity = 200;
    }
    var cont = element.parent();
    this.monthAdjust = 0;
    this.month = element.data('month');
    $("#mSelected").attr('id', '');
    element.attr("id", 'mSelected');

    this.reloadDays();
    this.loadMonths();
    scrollValue = this.getScrollValueEl(element);
    var self = this;
    cont.animate({scrollTop: scrollValue}, velocity, function () {
        setTimeout(function () {
            self.monthAdjust = 1;

        }, self.wait);

    });

};
mgdate.prototype.jumpToMonth = function (el) {
    this.month = el.data('month');
    var cont = el.parent();
    var newValue = this.getScrollValueEl(el);

    cont.scrollTop(newValue);
};
mgdate.prototype.infiniteScrollMonth = function () {
    var cont = $("#MG_Date_month .scroller");
    var wait = 250;

    if (this.monthAdjust === 1) {
        clearTimeout($.data(this, 'scrollTimer'));
        var self = this;
        $.data(this, 'scrollTimer', setTimeout(function () {
            self.adjustScrollMonth();
        }, wait));
    }

};
mgdate.prototype.adjustScrollMonth = function () {

    if (this.monthAdjust === 1) {

        var self = this;
        var cel = $("#MG_Date_month .scroller div:nth-child(1)");
        ;
        var halfCelHeight = cel.height() / 2;
        $("#MG_Date_month .scroller div").each(function () {

            if ($(this).position().top > -halfCelHeight) {
                var correct = $(this).next().next();
                self.goToMonth(correct, 50)
                return false;

            }
        });
    }
};

mgdate.prototype.loadMonths = function () {

    var div = this.getMonthHtml(this.month, this.year, true);
    if ($("#mSelected").length === 0) {
        $("#MG_Date_month .scroller").append(div);
    }
    this.loadPrevMonths();
    this.loadNextMonths();

    return $('#mSelected');
};
mgdate.prototype.getMonthHtml = function (month, year, selected) {
    if (month === 0) {
        month = 12;
        --year;
    }

    var div = document.createElement("div");
    div.setAttribute("data-month", month);

    if (selected !== undefined) {
        div.setAttribute("id", 'mSelected');
    }

    var nMonth = this.monthNames[this.lang][month];
    var t = document.createTextNode(nMonth);
    div.appendChild(t);

    return $(div);
};
mgdate.prototype.loadPrevMonths = function () {

    var selected = $("#mSelected");
    var tMonth = this.month - 1;
    var tYear = this.year;

    var prev = selected.prev();
    for (var i = 0; i < 60; i++) {
        if (tMonth === 0) {
            tMonth = 12;
            tYear--;
        }

        if (prev.length === 0) {

            var html = this.getMonthHtml(tMonth, tYear);
            $("#MG_Date_month .scroller").prepend(html);

        }
        prev = prev.prev();
        --tMonth;
    }

    while (prev.length != 0) {
        if (tMonth === 0) {
            tMonth = 12;
        }
        var tPrev = prev.prev();
        prev.remove();
        prev = tPrev;
        --tMonth;
    }
};

mgdate.prototype.loadNextMonths = function () {
    var selected = $("#mSelected");
    var tMonth = this.month + 1;
    var tYear = this.year;

    var next = selected.next();
    for (var i = 0; i < 60; i++) {
        if (tMonth === 13) {
            tMonth = 1;
        }

        if (next.length === 0) {

            var html = this.getMonthHtml(tMonth, tYear);
            $("#MG_Date_month .scroller").append(html);

        }
        next = next.next();
        ++tMonth;
    }

    while (next.length != 0) {
        if (tMonth === 13) {
            tMonth = 1;
        }
        var tNext = next.next();
        next.remove();
        next = tNext;
        ++tMonth;

    }
};

mgdate.prototype.setYear = function (number) {
    this.jumpToYear("y" + number);
};
mgdate.prototype.goToYear = function (id, velocity) {

    var element = $("#" + id);
    if (velocity === undefined) {
        velocity = 200;
    }
    var cont = element.parent();
    var prevYear = this.year;
    this.yearAdjust = 0;
    this.year = Number(element.html());

    this.reloadDays();
    if (this.quickLoad === false) {
        this.loadYears();
    }

    scrollValue = this.getScrollValue(id);
    var self = this;
    cont.animate({scrollTop: scrollValue}, velocity, function () {
        setTimeout(function () {
            self.yearAdjust = 1;
        }, self.wait);

    });
    maxScroll = cont.prop("scrollHeight")

};
mgdate.prototype.jumpToYear = function (id) {
    var el = $("#" + id);
    this.year = Number(el.html());
    var cont = el.parent();
    var newValue = this.getScrollValue(id);

    cont.scrollTop(newValue);
};
mgdate.prototype.infiniteScrollYear = function () {
    var cont = $("#MG_Date_year .scroller");
    var wait = 250;

    if (this.yearAdjust === 1) {
        clearTimeout($.data(this, 'scrollTimer'));
        var self = this;
        $.data(this, 'scrollTimer', setTimeout(function () {
            self.adjustScrollYear();
        }, wait));
    }
};
mgdate.prototype.adjustScrollYear = function () {

    if (this.yearAdjust === 1) {

        var self = this;
        var cel = $("#y" + this.year);
        var halfCelHeight = cel.height() / 2;
        $("#MG_Date_year .scroller div").each(function () {

            if ($(this).position().top > -halfCelHeight) {
                var correct = $(this).next().next();
                self.goToYear(correct.attr('id'), 50)
                return false;

            }
        });
    }
};

mgdate.prototype.loadYears = function () {
    console.log('carrega ano')
    this.loadPrevYears();
    if ($("#y" + this.year).length === 0) {
        var html = this.getYearHtml(this.year);
        $("#MG_Date_year .scroller").append(html);
    }
    this.loadNextYears();

};
mgdate.prototype.getYearHtml = function (year) {
    var div = document.createElement("div");
    $(div).attr("y" + year)
    var t = document.createTextNode(year);
    div.appendChild(t);
    div.setAttribute('id', 'y' + year);
    return div;
};
mgdate.prototype.loadPrevYears = function () {
    var start = this.year - 1;
    var end = (this.quickLoad === true) ? this.year - this.nLoadYearsPrev : this.year - 30;
    console.log('prev', end);
    while (start >= end) {
        if ($("#y" + start).length === 0) {
            var html = this.getYearHtml(start);
            $("#MG_Date_year .scroller").prepend(html);
        }
        start--;
    }
    while ($("#y" + start).length > 0) {
        $("#y" + start).remove();
        start--;
    }
};
mgdate.prototype.loadNextYears = function () {
    var start = this.year + 1;
    var end = (this.quickLoad === true) ? this.year + this.nLoadYearsNext : this.year + 30;
    console.log('next', end);
    while (start <= end) {
        if ($("#y" + start).length === 0) {
            var html = this.getYearHtml(start);
            $("#MG_Date_year .scroller").append(html);
        }
        start++;
    }
    while ($("#y" + start).length > 0) {
        $("#y" + start).remove();
        start++;
    }
};

mgdate.prototype.getScrollValue = function (id) {

    var element = $("#" + id);
    var scrollTarget = element.prev().prev();
    var cont = element.parent();

    var scrollValue = cont.scrollTop() + scrollTarget.position().top;

    return scrollValue;
};
mgdate.prototype.getScrollValueEl = function (element) {

    var scrollTarget = element.prev().prev();
    var cont = element.parent();

    var scrollValue = cont.scrollTop() + scrollTarget.position().top;

    return scrollValue;
};
mgdate.prototype.events = function (id) {
    var self = this;
    $("body").delegate("#MG_Date_day .scroller div", "click", function () {
        if (self.dayAdjust === 1) {
            self.goToDay($(this));
        }
    });
    $("#MG_Date_day .scroller").scroll(function () {
        self.infiniteScrollDay();
    });
    $("body").delegate("#MG_Date_month .scroller div", "click", function () {
        if (self.monthAdjust === 1) {
            self.goToMonth($(this));
        }
    });
    $("#MG_Date_month .scroller").scroll(function () {
        self.infiniteScrollMonth();
    });
    $("body").delegate("#MG_Date_year .scroller div", "click", function () {
        if (self.yearAdjust === 1) {
            self.goToYear($(this).attr('id'));
        }
    });
    $("#MG_Date_year .scroller").scroll(function () {
        self.infiniteScrollYear();
    });
    $("#MG_Date_Buttons .cancel").on("click", function () {
        self.cancel();
    });
    $("#MG_Date_Buttons .send").on("click", function () {
        self.send()
    });
};

mgdate.prototype.cancel = function () {
    $("#MG_Date_Back").fadeOut("fast", function () {
        $(this).remove();
    });
};
mgdate.prototype.send = function () {
    var day = this.day;
    var month = this.month;
    var year = this.year;
    if (day < 10) {
        day = '0' + day;
    }
    if (month < 10) {
        month = '0' + month;
    }
    var countYear = year.toString().length;
    var difYear = 4 - countYear;
    while (difYear > 0) {
        year = '0' + year;
        difYear--;
    }
    this.element.val(year + '-' + month + '-' + day);
    this.cancel();
};

mgdate.prototype.monthNames = {
    pt: ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    es: ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    en: ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};
mgdate.prototype.text = {
    pt: {cancel: 'cancelar', send: 'confirmar'},
    es: {cancel: 'cancelar', send: 'confirmar'},
    en: {cancel: 'cancel', send: 'confirm'},
};

//mgdate.prototype.monthNames = {engUS: ['','Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']};
//mgdate.prototype.text = {engUS: {cancel: 'cancel', send: 'send'}};

mgdate.prototype.lastDayMonth = function (year, month) {
    var year = Number(year);
    var month = Number(month);
    var lastDay = new Date(year, month);
    lastDay.setDate(0);
    return lastDay.getUTCDate();
};
mgdate.prototype.validDate = function (d, m, y) {
    var date = new Date(y, m - 1, d);
    return (date.getFullYear() == y && date.getMonth() + 1 == m && date.getDate() == d);
};
mgdate.prototype.loadHtml = function () {
    self = this;

    if ($("#MG_Date_Back").length === 0) {
        var mgDateBack = document.createElement("div");
        mgDateBack.setAttribute('id', 'MG_Date_Back');
        var mgDateContainer = document.createElement("div");
        mgDateContainer.setAttribute('id', 'MG_Date_Container');

        mgDateBack.appendChild(mgDateContainer);

        var mgDate = document.createElement("div");
        mgDate.setAttribute('id', 'MG_Date');
        mgDate.setAttribute('class', 'MG_Date');
        var mgDateButtons = document.createElement("div");
        mgDateButtons.setAttribute('id', 'MG_Date_Buttons');

        mgDateContainer.appendChild(mgDate);

        var celDay = document.createElement("div");
        celDay.setAttribute('id', 'MG_Date_celday');
        var day = document.createElement("div");
        day.setAttribute('id', 'MG_Date_day');
        var scroller = document.createElement("div");
        scroller.className = 'scroller';
        mgDate.appendChild(celDay);
        celDay.appendChild(day);
        day.appendChild(scroller);

        var celMonth = document.createElement("div");
        celMonth.setAttribute('id', 'MG_Date_celmonth');
        var month = document.createElement("div");
        month.setAttribute('id', 'MG_Date_month');
        var scroller2 = document.createElement("div");
        scroller2.className = 'scroller';

        mgDate.appendChild(celMonth);
        celMonth.appendChild(month);
        month.appendChild(scroller2);

        var celYear = document.createElement("div");
        celYear.setAttribute('id', 'MG_Date_celyear');
        var year = document.createElement("div");
        year.setAttribute('id', 'MG_Date_year');
        var scroller3 = document.createElement("div");
        scroller3.className = 'scroller';

        mgDate.appendChild(celYear);
        celYear.appendChild(year);
        year.appendChild(scroller3);

        var cover = document.createElement("div");
        cover.setAttribute('id', 'MG_Date_cover');
        cover.className = 'MG_Date';

        mgDate.appendChild(cover);
        var d1 = document.createElement("div");
        var d2 = document.createElement("div");
        var d3 = document.createElement("div");
        cover.appendChild(d1);
        cover.appendChild(d2);
        cover.appendChild(d3);

        mgDateContainer.appendChild(mgDateButtons);

        var ipCancel = document.createElement("input");
        ipCancel.id = "MG_Date_Cancel";
        ipCancel.type = "button";
        ipCancel.className = 'cancel';
        ipCancel.value = self.text[this.lang]['cancel'];
        var ipSend = document.createElement("input");
        ipSend.id = "MG_Date_Send";
        ipSend.type = "button";
        ipSend.className = 'send';
        ipSend.value = self.text[this.lang]['send'];
        mgDateButtons.appendChild(ipCancel);
        mgDateButtons.appendChild(ipSend);

        $("body").append(mgDateBack);
    }
};

$.fn.mgdate = function(){
    new mgdate($(this));
    return this;
};

module.exports = mgdate;

},{}],3:[function(require,module,exports){
module.exports = {
  'Date':   require('./date'),
};

},{"./date":2}],4:[function(require,module,exports){
var Checked = function(elements){

    this.elements = elements;
    this.msg = 'Selecione um dos campos';
};
module.exports = Checked;

Checked.prototype.isValid = function(value, cb){

    var res = false;
    if(this.elements.filter(':checked').size() == 1) res = true;

    cb(res);
};

},{}],5:[function(require,module,exports){
var Container = function(){

    this.elements = [];
};
module.exports = Container;

Container.prototype.append = function(element){

    this.elements.push(element);
};

Container.prototype.isValid = function(cb, obj){

  var promises = [];
  for(var e in this.elements){
      var element = this.elements[e];
      var def = new $.Deferred(function(def){
          element.isValid(function(res){ def.resolve(res); }, obj);
      });
      promises.push(def);
  }

  $.when.apply(undefined, promises).promise().done(function(){

      var args = Array.prototype.slice.call(arguments);
      cb(args.indexOf(false) < 0);
  });
};

Container.prototype.getValues = function(){

  var values = {};
  for(var e in this.elements){
    var element = this.elements[e];
    var name    = !!element.name ? element.name : element.attr('name');
    if(!!name)  values[name] = element.getValue();
  }

  return values;
};

},{}],6:[function(require,module,exports){
var Decorator = function(element, msg) {

    if(element.validators) return element;

    element.validators = [];
    element.filters    = [];

    if(!element.name) element.name = element.attr('name');

    element.addValidator = function(validator){
        this.validators.push(validator);
    };

    element.addFilter = function(filter){
        this.filter.push(filter);
    };

    element.getValue = function(){

        var value = this.val().trim();
        for(var f in this.filters){

          var filter = this.filters[f];
          var value  = filter.filter(value);
        }

        return value;
    };

    element.isValid = function(cb, obj) {

        var self = this;
        var res = true;
        var promises = [];
        var value = this.getValue();
        if (msg) msg.text('');
        element.removeClass('invalid');

        for(var v in this.validators){
            var validator = this.validators[v];
            var def = new $.Deferred(function(def) {
                validator.isValid(value, function(res) {
                    if (!res && msg) {
                        msg.text(validator.msg);
                        element.addClass('invalid');
                    }
                    def.resolve(res);
                }, obj);
            });
            promises.push(def);
        }


        $.when.apply(undefined, promises).promise().done(function() {

            var args = Array.prototype.slice.call(arguments);
            if (args.indexOf(false) >= 0) {
                cb(false);
            } else {
                cb(true);
            }
        });
    };

    return element;
};

module.exports = Decorator;

},{}],7:[function(require,module,exports){
module.exports = {
  'Container':         require('./container'),
  'Decorator':         require('./decorator'),
  'Checked':           require('./checked'),
  'NotEmpty':          require('./notEmpty'),
  'NotEmptyDependent': require('./notEmptyDependent'),
};

},{"./checked":4,"./container":5,"./decorator":6,"./notEmpty":8,"./notEmptyDependent":9}],8:[function(require,module,exports){
var NotEmpty = function(){

    this.msg = 'Campo obrigatório';
};
module.exports = NotEmpty;

NotEmpty.prototype.isValid = function(value, cb){

    var value = value.trim();
    if(value === null || value == undefined || value == ''){
        return cb(false);
    }

    return cb(true);
};

},{}],9:[function(require,module,exports){
var NotEmptyDependent = function(dep){

    this.dependent = dep;
    this.msg = 'Campo obrigatório';
};
module.exports = NotEmptyDependent;

NotEmptyDependent.prototype.isValid = function(value, cb){
    if(value == ''){
        var dep = this.dependent.val();
        if(dep != '') return cb(false);
    }

    return cb(true);
};

},{}],10:[function(require,module,exports){
var View = require('../view');

var base = function(){

  this.list      = [];
  this.name      = !!name ? name : '';
  this.label     = '';
  this.value     = null;
  this.container = null;
};
base.prototype = new View;
base.prototype.constructor = base;
module.exports = base;

base.prototype.setLabel = function(label){
  this.label = label;
};

base.prototype.val = function(value){

  if(value === undefined){
    return this.value;
  }else{
    this.value = value;
    this.makeInputs();
  }
};

base.prototype.attr        = function(){ /*for overwrite*/ };
base.prototype.removeClass = function(){ /*for overwrite*/ };
base.prototype.makeInputs  = function(){ /*for overwrite*/ };

},{"../view":15}],11:[function(require,module,exports){
module.exports = {
  'Base':          require('./base'),
  'Radio':         require('./radio'),
  'TextMultiRow':  require('./textMultiRow'),
};

},{"./base":10,"./radio":12,"./textMultiRow":13}],12:[function(require,module,exports){
var Base = require('./base');

var view = function(name){

  this.list      = [];
  this.name      = !!name ? name : '';
  this.title     = '';
  this.value     = '';
  this.container = null;
  this.title_cont  = CE('span', 'wdl');
  this.title_label = CE('label', 'item', 'item-input', 'item-stacked-label');
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.setTitle = function(title){
  this.title = title;
};

view.prototype.make = function(){

  var div = CE('div', 'box');

  div.append(this.title_label);

  this.title_cont.text(this.title);
  this.title_label.append(this.title_cont);

  this.message = CE('span', 'wdl', 'error');
  this.title_label.append(this.message);

  this.container = CE('div', 'box');
  this.makeInputs();
  div.append(this.container);

  return div;
};

view.prototype.makeInputs = function(){

  var self = this;
  this.container.html('');

  for(var x in this.list){

    var key   = this.list[x][0];
    var label = this.list[x][1];

    var input = CE('input').attr({type: 'radio', name: this.name, value: key});
    input.css({float: 'right', width: '30px', height: '2em', border: '0px'});
    this.container.append(CE('label', 'item').text(label).append(input));

    if(this.value == key) input.attr('checked', 'checked');
  }

  this.container.change(function(){ self.value = self.container.find(':checked').val(); });
};

view.prototype.add = function(key, label){
  this.list.push([key, label]);
};

},{"./base":10}],13:[function(require,module,exports){
var Base = require('./base');

var view = function(name){

  this.list      = [];
  this.name      = !!name ? name : '';
  this.title     = '';
  this.value     = '';
  this.container = null;
  this.sequence  = 0;
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.setTitle = function(title){
  this.title = title;
};

view.prototype.make = function(){

  var self = this;

  var div = CE('div', 'form-group');
  var label = CE('label').text(this.title);
  div.append(label);

  this.input = CE('input', 'form-control').attr({type: 'text'});
  this.input.focusout(function(){ self.add.call(self); });
  div.append(this.input);

  this.list = CE('div', 'box');
  div.append(this.list);

  this.output = CE('input').attr({type: 'hidden', name: this.name});
  div.append(this.output);

  return div;
};

view.prototype.add = function(){

  var found = false;

  var text  = this.input.val().trim();
  if(text == '') return;

  var rowid = parseInt(this.input.attr('rowid'));

  if(isNaN(rowid)) rowid = --this.sequence;

  var values = this.getValues();
  for(var v in values){
    var value = values[v];
    if(value.id == rowid){
      found = true;
      values[v].value = text;
      break;
    }
  }

  if(!found){
    values.push({id: rowid, value: text});
  }

  this.setValues(values);
  this.refresh(values);
  this.clear_input();
  this.input.focus();
};

view.prototype.clear_input = function(){
  this.input.val('');
  this.input.attr('rowid', '');
};

view.prototype.refresh = function(values){

  var self = this;

  this.list.html('');
  var div = CE('div', 'box').css({'border': '1px solid #ccc', 'margin-top': '5px'});
  this.list.append(div);

  var values = !!values ? values : this.getValues();

  if(values.length == 0){
    div.remove();
    return;
  }

  for(var v in values){
    var value = values[v];
    var row   = CE('div', 'box').css({'border-bottom': '1px solid #ccc', 'padding': '5px'}).attr('rowid', value.id);
    div.append(row);
    var text  = CE('span', 'left').text(value.value);
    row.append(text);

    (function(value){

      var del  = CE('button', 'btn', 'btn-danger', 'btn-xs', 'right').attr({type: 'button'}).text('Apagar');
      del.click(function(){ self.delete.call(self, value.id) });
      row.append(del);

      var edit = CE('button', 'btn', 'btn-warning', 'btn-xs', 'right').attr({type: 'button'}).text('Editar');
      edit.click(function(){ self.edit.call(self, value.id) });
      row.append(edit);

    })(value);
  };
};

view.prototype.edit = function(id){

  var values = this.getValues();
  var self   = this;

  for(var v in values){
    var value = values[v];
    if(value.id == id){
      self.input.val(value.value);
      self.input.attr('rowid', value.id);
      break;
    }
  }
};

view.prototype.delete = function(id){

  var values = this.getValues();
  var self   = this;

  for(var v in values){
    var value = values[v];
    if(value.id == id){

      values.splice(v, 1);
      break;
    }
  }

  this.setValues(values);
  this.refresh();
};

view.prototype.getValues = function(){

  var json_data = this.output.val();
  if(json_data == '') json_data = '[]';
  return JSON.parse(json_data);
};

view.prototype.setValues = function(values){

  var json_data = JSON.stringify(values);
  this.output.val(json_data);
};

},{"./base":10}],14:[function(require,module,exports){
module.exports = {
  'View':   require('./view'),
  'field':  require('./field/index'),
};

},{"./field/index":11,"./view":15}],15:[function(require,module,exports){
var CE = function(tag){

    var element = $(document.createElement(tag));
    for(var i = 1; i < arguments.length; i++){
        element.addClass(arguments[i]);
    }
    return element;
};
window.CE = CE;

var base = function(C){

    this.pos_make = [];
    this.pre_make = [];
    this.C = C; //Controller
}

base.prototype.toString = function(){
    return this.render();
};

base.prototype.make     = function(){};

base.prototype.render = function(){

    var self = this;

    $.each(this.pre_make, function(k, v){ v.call(self); });
    var render = this.make();
    $.each(this.pos_make, function(k, v){ v.call(self); });
    return render;
};

module.exports = base;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9wbHVnaW5zL2RhdGUuanMiLCJzcmMvcGx1Z2lucy9pbmRleC5qcyIsInNyYy92YWxpZGF0ZS9jaGVja2VkLmpzIiwic3JjL3ZhbGlkYXRlL2NvbnRhaW5lci5qcyIsInNyYy92YWxpZGF0ZS9kZWNvcmF0b3IuanMiLCJzcmMvdmFsaWRhdGUvaW5kZXguanMiLCJzcmMvdmFsaWRhdGUvbm90RW1wdHkuanMiLCJzcmMvdmFsaWRhdGUvbm90RW1wdHlEZXBlbmRlbnQuanMiLCJzcmMvdmlldy9maWVsZC9iYXNlLmpzIiwic3JjL3ZpZXcvZmllbGQvaW5kZXguanMiLCJzcmMvdmlldy9maWVsZC9yYWRpby5qcyIsInNyYy92aWV3L2ZpZWxkL3RleHRNdWx0aVJvdy5qcyIsInNyYy92aWV3L2luZGV4LmpzIiwic3JjL3ZpZXcvdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlzQkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICd2aWV3JzogICAgIHJlcXVpcmUoJy4vdmlldy9pbmRleCcpLFxuICAndmFsaWRhdGUnOiByZXF1aXJlKCcuL3ZhbGlkYXRlL2luZGV4JyksXG4gICdwbHVnaW5zJzogIHJlcXVpcmUoJy4vcGx1Z2lucy9pbmRleCcpLFxufTtcbiIsInZhciBtZ2RhdGUgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgbGFuZyA9ICgkKGVsZW1lbnQpLmRhdGEoXCJsYW5nXCIpICE9PSB1bmRlZmluZWQpID8gJChlbGVtZW50KS5kYXRhKFwibGFuZ1wiKSA6ICdwdCc7XG4gICAgY29uc29sZS5sb2cobGFuZylcbiAgICAkKGVsZW1lbnQpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdmFsID0gJCh0aGlzKS52YWwoKTtcbiAgICAgICAgJCh0aGlzKS5hdHRyKCdyZWFkb25seScsIHRydWUpO1xuICAgICAgICB2YXIgZGF5ID0gJycsIG1vbnRoID0gJycsIHllYXIgPSAnJztcbiAgICAgICAgdmFyIGFycmF5VmFsdWUgPSB2YWwuc3BsaXQoJy0nKVxuICAgICAgICB2YXIgdmFsaWQgPSBzZWxmLnZhbGlkRGF0ZShhcnJheVZhbHVlWzJdLCBhcnJheVZhbHVlWzFdLCBhcnJheVZhbHVlWzBdKVxuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQgfHwgdmFsID09PSAnJyB8fCB2YWxpZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICBkYXkgPSB0b2RheS5nZXREYXRlKCk7XG4gICAgICAgICAgICBtb250aCA9IHRvZGF5LmdldE1vbnRoKCkgKyAxO1xuICAgICAgICAgICAgeWVhciA9IHRvZGF5LmdldEZ1bGxZZWFyKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXkgPSBOdW1iZXIoYXJyYXlWYWx1ZVsyXSk7XG4gICAgICAgICAgICBtb250aCA9IE51bWJlcihhcnJheVZhbHVlWzFdKTtcbiAgICAgICAgICAgIHllYXIgPSBOdW1iZXIoYXJyYXlWYWx1ZVswXSk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5pbml0KCQodGhpcyksIGRheSwgbW9udGgsIHllYXIsIGxhbmcpO1xuICAgIH0pO1xufTtcblxubWdkYXRlLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGRheSwgbW9udGgsIHllYXIsIGxhbmcpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMuZGF5ID0gZGF5O1xuICAgIHRoaXMubW9udGggPSBtb250aDtcbiAgICB0aGlzLnllYXIgPSB5ZWFyO1xuXG4gICAgdGhpcy5sYW5nID0gbGFuZztcbiAgICB0aGlzLm5Mb2FkWWVhcnNQcmV2ID0gMTUwO1xuICAgIHRoaXMubkxvYWRZZWFyc05leHQgPSA1MDtcblxuICAgIHRoaXMucXVpY2tMb2FkID0gdHJ1ZTtcblxuICAgIHRoaXMubG9hZEh0bWwoKTtcbiAgICAkKFwiI01HX0RhdGVfQmFja1wiKS5mYWRlSW4oXCJmYXN0XCIpO1xuICAgIHRoaXMuZGF5QWRqdXN0ID0gMTtcbiAgICB0aGlzLm1vbnRoQWRqdXN0ID0gMTtcbiAgICB0aGlzLnllYXJBZGp1c3QgPSAxO1xuICAgIHRoaXMubG9hZERheXMoKTtcbiAgICB0aGlzLmxvYWRZZWFycygpO1xuICAgIGVsTW9udGggPSB0aGlzLmxvYWRNb250aHMoKTtcbiAgICBlbERheSA9IHRoaXMubG9hZERheXMoKTtcblxuICAgIHRoaXMuc2V0WWVhcih0aGlzLnllYXIpO1xuICAgIHRoaXMuc2V0TW9udGgoZWxNb250aCk7XG4gICAgdGhpcy5zZXREYXkoZWxEYXkpO1xuICAgIHRoaXMuZXZlbnRzKCk7XG4gICAgdGhpcy53YWl0ID0gNTA7XG5cbn07XG5tZ2RhdGUucHJvdG90eXBlLnNldERheSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLmp1bXBUb0RheShlbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAkKFwiI01HX0RhdGVfZGF5IC5zY3JvbGxlclwiKS5odG1sKCcnKTtcbiAgICAgICAgdmFyIHNlbGVjdGVkID0gdGhpcy5sb2FkRGF5cygpO1xuICAgICAgICB0aGlzLmp1bXBUb0RheShzZWxlY3RlZCk7XG4gICAgfVxufVxubWdkYXRlLnByb3RvdHlwZS5nb1RvRGF5ID0gZnVuY3Rpb24gKGVsZW1lbnQsIHZlbG9jaXR5KSB7XG5cbiAgICBpZiAodmVsb2NpdHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2ZWxvY2l0eSA9IDIwMDtcbiAgICB9XG5cbiAgICB2YXIgY29udCA9IGVsZW1lbnQucGFyZW50KCk7XG4gICAgdGhpcy5kYXlBZGp1c3QgPSAwO1xuICAgIHRoaXMuZGF5ID0gTnVtYmVyKGVsZW1lbnQuZGF0YSgnZGF5JykpO1xuICAgICQoXCIjZFNlbGVjdGVkXCIpLmF0dHIoJ2lkJywgJycpO1xuICAgIGVsZW1lbnQuYXR0cihcImlkXCIsICdkU2VsZWN0ZWQnKTtcbiAgICB0aGlzLmxvYWREYXlzKCk7XG4gICAgc2Nyb2xsVmFsdWUgPSB0aGlzLmdldFNjcm9sbFZhbHVlRWwoZWxlbWVudCk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGNvbnQuYW5pbWF0ZSh7c2Nyb2xsVG9wOiBzY3JvbGxWYWx1ZX0sIHZlbG9jaXR5LCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGVsZW1lbnQuZGF0YSgndHlwZScpID09PSAnZicpIHtcbiAgICAgICAgICAgIHZhciByZWFsSWQgPSBcImRcIiArIHNlbGYuZGF5O1xuICAgICAgICAgICAgc2VsZi5qdW1wVG9EYXkocmVhbElkKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGF5QWRqdXN0ID0gMTtcbiAgICAgICAgfSwgc2VsZi53YWl0KTtcblxuICAgIH0pO1xufTtcbm1nZGF0ZS5wcm90b3R5cGUuanVtcFRvRGF5ID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgdGhpcy5kYXkgPSBlbC5kYXRhKCdkYXknKTtcblxuICAgIHZhciBjb250ID0gZWwucGFyZW50KCk7XG4gICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5nZXRTY3JvbGxWYWx1ZUVsKGVsKTtcblxuICAgIGNvbnQuc2Nyb2xsVG9wKG5ld1ZhbHVlKTtcbn1cbm1nZGF0ZS5wcm90b3R5cGUuZ2V0RGF5SHRtbCA9IGZ1bmN0aW9uIChkYXksIHNlbGVjdGVkKSB7XG5cbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAkKGRpdikuYXR0cihcImRhdGEtZGF5XCIsIGRheSk7XG4gICAgaWYgKHNlbGVjdGVkID09PSB0cnVlKSB7XG4gICAgICAgICQoZGl2KS5hdHRyKFwiaWRcIiwgJ2RTZWxlY3RlZCcpO1xuICAgIH1cbiAgICBpZiAoZGF5ID4gMjgpIHtcbiAgICAgICAgJChkaXYpLmF0dHIoXCJjbGFzc1wiLCAnZCcgKyBkYXkpO1xuICAgIH1cbiAgICB2YXIgbkRheSA9IChkYXkgPCAxMCkgPyAnMCcgKyBkYXkgOiBkYXk7XG4gICAgdmFyIHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShuRGF5KTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQodCk7XG5cbiAgICByZXR1cm4gJChkaXYpO1xufTtcbm1nZGF0ZS5wcm90b3R5cGUucmVsb2FkRGF5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbGFzdERheSA9IHRoaXMubGFzdERheU1vbnRoKHRoaXMueWVhciwgdGhpcy5tb250aCk7XG4gICAgdmFyIGRpZiA9IGxhc3REYXkgLSB0aGlzLmRheTtcbiAgICBlbCA9ICQoXCIjZFNlbGVjdGVkXCIpO1xuICAgIGlmIChkaWYgPCAwKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpID4gZGlmOyBpLS0pIHtcbiAgICAgICAgICAgIHByZXYgPSBlbC5wcmV2KCk7XG4gICAgICAgICAgICBlbCA9IHByZXY7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5nb1RvRGF5KGVsKTtcbiAgICAkKFwiI01HX0RhdGVfZGF5IC5zY3JvbGxlclwiKS5odG1sKCcnKTtcbiAgICB0aGlzLmxvYWREYXlzKCk7XG59XG5tZ2RhdGUucHJvdG90eXBlLmxvYWREYXlzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkaXYgPSB0aGlzLmdldERheUh0bWwodGhpcy5kYXksIHRydWUpO1xuICAgIGlmICgkKFwiI2RTZWxlY3RlZFwiKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgJChcIiNNR19EYXRlX2RheSAuc2Nyb2xsZXJcIikuYXBwZW5kKGRpdik7XG4gICAgfVxuICAgIHZhciBsYXN0RGF5ID0gdGhpcy5sYXN0RGF5TW9udGgodGhpcy55ZWFyLCB0aGlzLm1vbnRoKVxuICAgIHRoaXMubG9hZFByZXZEYXlzKGxhc3REYXkpO1xuICAgIHRoaXMubG9hZE5leHREYXlzKGxhc3REYXkpO1xuXG4gICAgcmV0dXJuICQoJyNkU2VsZWN0ZWQnKTtcbn07XG5tZ2RhdGUucHJvdG90eXBlLmxvYWRQcmV2RGF5cyA9IGZ1bmN0aW9uIChsYXN0RGF5KSB7XG5cbiAgICB2YXIgc2VsZWN0ZWQgPSAkKFwiI2RTZWxlY3RlZFwiKTtcbiAgICB2YXIgdERheSA9IHRoaXMuZGF5IC0gMTtcbiAgICB2YXIgcHJldiA9IHNlbGVjdGVkLnByZXYoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDYwOyBpKyspIHtcbiAgICAgICAgaWYgKHREYXkgPT09IDApIHtcbiAgICAgICAgICAgIHREYXkgPSBsYXN0RGF5O1xuICAgICAgICB9XG4gICAgICAgIHZhciBodG1sID0gdGhpcy5nZXREYXlIdG1sKHREYXkpO1xuICAgICAgICBpZiAocHJldi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICQoXCIjTUdfRGF0ZV9kYXkgLnNjcm9sbGVyXCIpLnByZXBlbmQoaHRtbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcmV2Lmh0bWwoaHRtbC5odG1sKCkpXG4gICAgICAgIH1cbiAgICAgICAgcHJldiA9IHByZXYucHJldigpO1xuICAgICAgICAtLXREYXk7XG4gICAgfVxuXG4gICAgdmFyIGkyID0gMDtcbiAgICB3aGlsZSAocHJldi5sZW5ndGggIT0gMCkge1xuICAgICAgICBpZiAodERheSA9PT0gMCkge1xuICAgICAgICAgICAgdERheSA9IGxhc3REYXk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRQcmV2ID0gcHJldi5wcmV2KCk7XG4gICAgICAgIHByZXYucmVtb3ZlKCk7XG4gICAgICAgIHByZXYgPSB0UHJldjtcbiAgICAgICAgLS10RGF5O1xuICAgIH1cblxufVxuXG5cbm1nZGF0ZS5wcm90b3R5cGUubG9hZE5leHREYXlzID0gZnVuY3Rpb24gKGxhc3REYXkpIHtcblxuICAgIHZhciBzZWxlY3RlZCA9ICQoXCIjZFNlbGVjdGVkXCIpO1xuICAgIHZhciB0RGF5ID0gdGhpcy5kYXkgKyAxO1xuICAgIHZhciBuZXh0ID0gc2VsZWN0ZWQubmV4dCgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjA7IGkrKykge1xuICAgICAgICBpZiAodERheSA9PT0gbGFzdERheSArIDEpIHtcbiAgICAgICAgICAgIHREYXkgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5leHQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB2YXIgaHRtbCA9IHRoaXMuZ2V0RGF5SHRtbCh0RGF5KTtcbiAgICAgICAgICAgICQoXCIjTUdfRGF0ZV9kYXkgLnNjcm9sbGVyXCIpLmFwcGVuZChodG1sKTtcblxuICAgICAgICB9XG4gICAgICAgIG5leHQgPSBuZXh0Lm5leHQoKTtcbiAgICAgICAgKyt0RGF5O1xuICAgIH1cblxuICAgIHdoaWxlIChuZXh0Lmxlbmd0aCAhPSAwKSB7XG4gICAgICAgIGlmICh0RGF5ID09PSBsYXN0RGF5ICsgMSkge1xuICAgICAgICAgICAgdERheSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHROZXh0ID0gbmV4dC5uZXh0KCk7XG4gICAgICAgIG5leHQucmVtb3ZlKCk7XG4gICAgICAgIG5leHQgPSB0TmV4dDtcbiAgICAgICAgKyt0RGF5O1xuICAgIH1cblxufTtcbm1nZGF0ZS5wcm90b3R5cGUuaW5maW5pdGVTY3JvbGxEYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbnQgPSAkKFwiI01HX0RhdGVfZGF5IC5zY3JvbGxlclwiKTtcbiAgICB2YXIgd2FpdCA9IDI1MDtcblxuXG4gICAgaWYgKHRoaXMuZGF5QWRqdXN0ID09PSAxKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCgkLmRhdGEodGhpcywgJ3Njcm9sbFRpbWVyJykpO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICQuZGF0YSh0aGlzLCAnc2Nyb2xsVGltZXInLCBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0U2Nyb2xsRGF5KCk7XG4gICAgICAgIH0sIHdhaXQpKTtcbiAgICB9XG5cbn07XG5tZ2RhdGUucHJvdG90eXBlLmFkanVzdFNjcm9sbERheSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICh0aGlzLmRheUFkanVzdCA9PT0gMSkge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNlbCA9ICQoXCIjTUdfRGF0ZV9kYXkgLnNjcm9sbGVyIGRpdjpudGgtY2hpbGQoMSlcIik7XG4gICAgICAgIDtcbiAgICAgICAgdmFyIGhhbGZDZWxIZWlnaHQgPSBjZWwuaGVpZ2h0KCkgLyAyO1xuXG4gICAgICAgICQoXCIjTUdfRGF0ZV9kYXkgLnNjcm9sbGVyIGRpdlwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vaWYoJCh0aGlzKS5jc3MoJ2Rpc3BsYXknKSA9PT0gJ2Jsb2NrJyl7XG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5wb3NpdGlvbigpLnRvcCA+IC1oYWxmQ2VsSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvcnJlY3QgPSAkKHRoaXMpLm5leHQoKS5uZXh0KCk7XG4gICAgICAgICAgICAgICAgc2VsZi5nb1RvRGF5KGNvcnJlY3QsIDUwKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy99XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbm1nZGF0ZS5wcm90b3R5cGUuc2V0TW9udGggPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5qdW1wVG9Nb250aChlbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAkKFwiI01HX0RhdGVfbW9udGggLnNjcm9sbGVyXCIpLmh0bWwoJycpO1xuICAgICAgICB2YXIgc2VsZWN0ZWQgPSB0aGlzLmxvYWRNb250aHMoKTtcbiAgICAgICAgdGhpcy5qdW1wVG9Nb250aChzZWxlY3RlZCk7XG4gICAgfVxufTtcbm1nZGF0ZS5wcm90b3R5cGUuZ29Ub01vbnRoID0gZnVuY3Rpb24gKGVsZW1lbnQsIHZlbG9jaXR5KSB7XG5cbiAgICB2YXIgZWxZZWFyID0gTnVtYmVyKGVsZW1lbnQuZGF0YShcInllYXJcIikpO1xuXG4gICAgaWYgKHZlbG9jaXR5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmVsb2NpdHkgPSAyMDA7XG4gICAgfVxuICAgIHZhciBjb250ID0gZWxlbWVudC5wYXJlbnQoKTtcbiAgICB0aGlzLm1vbnRoQWRqdXN0ID0gMDtcbiAgICB0aGlzLm1vbnRoID0gZWxlbWVudC5kYXRhKCdtb250aCcpO1xuICAgICQoXCIjbVNlbGVjdGVkXCIpLmF0dHIoJ2lkJywgJycpO1xuICAgIGVsZW1lbnQuYXR0cihcImlkXCIsICdtU2VsZWN0ZWQnKTtcblxuICAgIHRoaXMucmVsb2FkRGF5cygpO1xuICAgIHRoaXMubG9hZE1vbnRocygpO1xuICAgIHNjcm9sbFZhbHVlID0gdGhpcy5nZXRTY3JvbGxWYWx1ZUVsKGVsZW1lbnQpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBjb250LmFuaW1hdGUoe3Njcm9sbFRvcDogc2Nyb2xsVmFsdWV9LCB2ZWxvY2l0eSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYubW9udGhBZGp1c3QgPSAxO1xuXG4gICAgICAgIH0sIHNlbGYud2FpdCk7XG5cbiAgICB9KTtcblxufTtcbm1nZGF0ZS5wcm90b3R5cGUuanVtcFRvTW9udGggPSBmdW5jdGlvbiAoZWwpIHtcbiAgICB0aGlzLm1vbnRoID0gZWwuZGF0YSgnbW9udGgnKTtcbiAgICB2YXIgY29udCA9IGVsLnBhcmVudCgpO1xuICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZ2V0U2Nyb2xsVmFsdWVFbChlbCk7XG5cbiAgICBjb250LnNjcm9sbFRvcChuZXdWYWx1ZSk7XG59O1xubWdkYXRlLnByb3RvdHlwZS5pbmZpbml0ZVNjcm9sbE1vbnRoID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb250ID0gJChcIiNNR19EYXRlX21vbnRoIC5zY3JvbGxlclwiKTtcbiAgICB2YXIgd2FpdCA9IDI1MDtcblxuICAgIGlmICh0aGlzLm1vbnRoQWRqdXN0ID09PSAxKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCgkLmRhdGEodGhpcywgJ3Njcm9sbFRpbWVyJykpO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICQuZGF0YSh0aGlzLCAnc2Nyb2xsVGltZXInLCBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0U2Nyb2xsTW9udGgoKTtcbiAgICAgICAgfSwgd2FpdCkpO1xuICAgIH1cblxufTtcbm1nZGF0ZS5wcm90b3R5cGUuYWRqdXN0U2Nyb2xsTW9udGggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAodGhpcy5tb250aEFkanVzdCA9PT0gMSkge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNlbCA9ICQoXCIjTUdfRGF0ZV9tb250aCAuc2Nyb2xsZXIgZGl2Om50aC1jaGlsZCgxKVwiKTtcbiAgICAgICAgO1xuICAgICAgICB2YXIgaGFsZkNlbEhlaWdodCA9IGNlbC5oZWlnaHQoKSAvIDI7XG4gICAgICAgICQoXCIjTUdfRGF0ZV9tb250aCAuc2Nyb2xsZXIgZGl2XCIpLmVhY2goZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5wb3NpdGlvbigpLnRvcCA+IC1oYWxmQ2VsSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvcnJlY3QgPSAkKHRoaXMpLm5leHQoKS5uZXh0KCk7XG4gICAgICAgICAgICAgICAgc2VsZi5nb1RvTW9udGgoY29ycmVjdCwgNTApXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbm1nZGF0ZS5wcm90b3R5cGUubG9hZE1vbnRocyA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBkaXYgPSB0aGlzLmdldE1vbnRoSHRtbCh0aGlzLm1vbnRoLCB0aGlzLnllYXIsIHRydWUpO1xuICAgIGlmICgkKFwiI21TZWxlY3RlZFwiKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgJChcIiNNR19EYXRlX21vbnRoIC5zY3JvbGxlclwiKS5hcHBlbmQoZGl2KTtcbiAgICB9XG4gICAgdGhpcy5sb2FkUHJldk1vbnRocygpO1xuICAgIHRoaXMubG9hZE5leHRNb250aHMoKTtcblxuICAgIHJldHVybiAkKCcjbVNlbGVjdGVkJyk7XG59O1xubWdkYXRlLnByb3RvdHlwZS5nZXRNb250aEh0bWwgPSBmdW5jdGlvbiAobW9udGgsIHllYXIsIHNlbGVjdGVkKSB7XG4gICAgaWYgKG1vbnRoID09PSAwKSB7XG4gICAgICAgIG1vbnRoID0gMTI7XG4gICAgICAgIC0teWVhcjtcbiAgICB9XG5cbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkaXYuc2V0QXR0cmlidXRlKFwiZGF0YS1tb250aFwiLCBtb250aCk7XG5cbiAgICBpZiAoc2VsZWN0ZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkaXYuc2V0QXR0cmlidXRlKFwiaWRcIiwgJ21TZWxlY3RlZCcpO1xuICAgIH1cblxuICAgIHZhciBuTW9udGggPSB0aGlzLm1vbnRoTmFtZXNbdGhpcy5sYW5nXVttb250aF07XG4gICAgdmFyIHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShuTW9udGgpO1xuICAgIGRpdi5hcHBlbmRDaGlsZCh0KTtcblxuICAgIHJldHVybiAkKGRpdik7XG59O1xubWdkYXRlLnByb3RvdHlwZS5sb2FkUHJldk1vbnRocyA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBzZWxlY3RlZCA9ICQoXCIjbVNlbGVjdGVkXCIpO1xuICAgIHZhciB0TW9udGggPSB0aGlzLm1vbnRoIC0gMTtcbiAgICB2YXIgdFllYXIgPSB0aGlzLnllYXI7XG5cbiAgICB2YXIgcHJldiA9IHNlbGVjdGVkLnByZXYoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDYwOyBpKyspIHtcbiAgICAgICAgaWYgKHRNb250aCA9PT0gMCkge1xuICAgICAgICAgICAgdE1vbnRoID0gMTI7XG4gICAgICAgICAgICB0WWVhci0tO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByZXYubGVuZ3RoID09PSAwKSB7XG5cbiAgICAgICAgICAgIHZhciBodG1sID0gdGhpcy5nZXRNb250aEh0bWwodE1vbnRoLCB0WWVhcik7XG4gICAgICAgICAgICAkKFwiI01HX0RhdGVfbW9udGggLnNjcm9sbGVyXCIpLnByZXBlbmQoaHRtbCk7XG5cbiAgICAgICAgfVxuICAgICAgICBwcmV2ID0gcHJldi5wcmV2KCk7XG4gICAgICAgIC0tdE1vbnRoO1xuICAgIH1cblxuICAgIHdoaWxlIChwcmV2Lmxlbmd0aCAhPSAwKSB7XG4gICAgICAgIGlmICh0TW9udGggPT09IDApIHtcbiAgICAgICAgICAgIHRNb250aCA9IDEyO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0UHJldiA9IHByZXYucHJldigpO1xuICAgICAgICBwcmV2LnJlbW92ZSgpO1xuICAgICAgICBwcmV2ID0gdFByZXY7XG4gICAgICAgIC0tdE1vbnRoO1xuICAgIH1cbn07XG5cbm1nZGF0ZS5wcm90b3R5cGUubG9hZE5leHRNb250aHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGVjdGVkID0gJChcIiNtU2VsZWN0ZWRcIik7XG4gICAgdmFyIHRNb250aCA9IHRoaXMubW9udGggKyAxO1xuICAgIHZhciB0WWVhciA9IHRoaXMueWVhcjtcblxuICAgIHZhciBuZXh0ID0gc2VsZWN0ZWQubmV4dCgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjA7IGkrKykge1xuICAgICAgICBpZiAodE1vbnRoID09PSAxMykge1xuICAgICAgICAgICAgdE1vbnRoID0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXh0Lmxlbmd0aCA9PT0gMCkge1xuXG4gICAgICAgICAgICB2YXIgaHRtbCA9IHRoaXMuZ2V0TW9udGhIdG1sKHRNb250aCwgdFllYXIpO1xuICAgICAgICAgICAgJChcIiNNR19EYXRlX21vbnRoIC5zY3JvbGxlclwiKS5hcHBlbmQoaHRtbCk7XG5cbiAgICAgICAgfVxuICAgICAgICBuZXh0ID0gbmV4dC5uZXh0KCk7XG4gICAgICAgICsrdE1vbnRoO1xuICAgIH1cblxuICAgIHdoaWxlIChuZXh0Lmxlbmd0aCAhPSAwKSB7XG4gICAgICAgIGlmICh0TW9udGggPT09IDEzKSB7XG4gICAgICAgICAgICB0TW9udGggPSAxO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0TmV4dCA9IG5leHQubmV4dCgpO1xuICAgICAgICBuZXh0LnJlbW92ZSgpO1xuICAgICAgICBuZXh0ID0gdE5leHQ7XG4gICAgICAgICsrdE1vbnRoO1xuXG4gICAgfVxufTtcblxubWdkYXRlLnByb3RvdHlwZS5zZXRZZWFyID0gZnVuY3Rpb24gKG51bWJlcikge1xuICAgIHRoaXMuanVtcFRvWWVhcihcInlcIiArIG51bWJlcik7XG59O1xubWdkYXRlLnByb3RvdHlwZS5nb1RvWWVhciA9IGZ1bmN0aW9uIChpZCwgdmVsb2NpdHkpIHtcblxuICAgIHZhciBlbGVtZW50ID0gJChcIiNcIiArIGlkKTtcbiAgICBpZiAodmVsb2NpdHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2ZWxvY2l0eSA9IDIwMDtcbiAgICB9XG4gICAgdmFyIGNvbnQgPSBlbGVtZW50LnBhcmVudCgpO1xuICAgIHZhciBwcmV2WWVhciA9IHRoaXMueWVhcjtcbiAgICB0aGlzLnllYXJBZGp1c3QgPSAwO1xuICAgIHRoaXMueWVhciA9IE51bWJlcihlbGVtZW50Lmh0bWwoKSk7XG5cbiAgICB0aGlzLnJlbG9hZERheXMoKTtcbiAgICBpZiAodGhpcy5xdWlja0xvYWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMubG9hZFllYXJzKCk7XG4gICAgfVxuXG4gICAgc2Nyb2xsVmFsdWUgPSB0aGlzLmdldFNjcm9sbFZhbHVlKGlkKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgY29udC5hbmltYXRlKHtzY3JvbGxUb3A6IHNjcm9sbFZhbHVlfSwgdmVsb2NpdHksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLnllYXJBZGp1c3QgPSAxO1xuICAgICAgICB9LCBzZWxmLndhaXQpO1xuXG4gICAgfSk7XG4gICAgbWF4U2Nyb2xsID0gY29udC5wcm9wKFwic2Nyb2xsSGVpZ2h0XCIpXG5cbn07XG5tZ2RhdGUucHJvdG90eXBlLmp1bXBUb1llYXIgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICB2YXIgZWwgPSAkKFwiI1wiICsgaWQpO1xuICAgIHRoaXMueWVhciA9IE51bWJlcihlbC5odG1sKCkpO1xuICAgIHZhciBjb250ID0gZWwucGFyZW50KCk7XG4gICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5nZXRTY3JvbGxWYWx1ZShpZCk7XG5cbiAgICBjb250LnNjcm9sbFRvcChuZXdWYWx1ZSk7XG59O1xubWdkYXRlLnByb3RvdHlwZS5pbmZpbml0ZVNjcm9sbFllYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbnQgPSAkKFwiI01HX0RhdGVfeWVhciAuc2Nyb2xsZXJcIik7XG4gICAgdmFyIHdhaXQgPSAyNTA7XG5cbiAgICBpZiAodGhpcy55ZWFyQWRqdXN0ID09PSAxKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCgkLmRhdGEodGhpcywgJ3Njcm9sbFRpbWVyJykpO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICQuZGF0YSh0aGlzLCAnc2Nyb2xsVGltZXInLCBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0U2Nyb2xsWWVhcigpO1xuICAgICAgICB9LCB3YWl0KSk7XG4gICAgfVxufTtcbm1nZGF0ZS5wcm90b3R5cGUuYWRqdXN0U2Nyb2xsWWVhciA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICh0aGlzLnllYXJBZGp1c3QgPT09IDEpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBjZWwgPSAkKFwiI3lcIiArIHRoaXMueWVhcik7XG4gICAgICAgIHZhciBoYWxmQ2VsSGVpZ2h0ID0gY2VsLmhlaWdodCgpIC8gMjtcbiAgICAgICAgJChcIiNNR19EYXRlX3llYXIgLnNjcm9sbGVyIGRpdlwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKCQodGhpcykucG9zaXRpb24oKS50b3AgPiAtaGFsZkNlbEhlaWdodCkge1xuICAgICAgICAgICAgICAgIHZhciBjb3JyZWN0ID0gJCh0aGlzKS5uZXh0KCkubmV4dCgpO1xuICAgICAgICAgICAgICAgIHNlbGYuZ29Ub1llYXIoY29ycmVjdC5hdHRyKCdpZCcpLCA1MClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxubWdkYXRlLnByb3RvdHlwZS5sb2FkWWVhcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ2NhcnJlZ2EgYW5vJylcbiAgICB0aGlzLmxvYWRQcmV2WWVhcnMoKTtcbiAgICBpZiAoJChcIiN5XCIgKyB0aGlzLnllYXIpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB2YXIgaHRtbCA9IHRoaXMuZ2V0WWVhckh0bWwodGhpcy55ZWFyKTtcbiAgICAgICAgJChcIiNNR19EYXRlX3llYXIgLnNjcm9sbGVyXCIpLmFwcGVuZChodG1sKTtcbiAgICB9XG4gICAgdGhpcy5sb2FkTmV4dFllYXJzKCk7XG5cbn07XG5tZ2RhdGUucHJvdG90eXBlLmdldFllYXJIdG1sID0gZnVuY3Rpb24gKHllYXIpIHtcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAkKGRpdikuYXR0cihcInlcIiArIHllYXIpXG4gICAgdmFyIHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh5ZWFyKTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQodCk7XG4gICAgZGl2LnNldEF0dHJpYnV0ZSgnaWQnLCAneScgKyB5ZWFyKTtcbiAgICByZXR1cm4gZGl2O1xufTtcbm1nZGF0ZS5wcm90b3R5cGUubG9hZFByZXZZZWFycyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLnllYXIgLSAxO1xuICAgIHZhciBlbmQgPSAodGhpcy5xdWlja0xvYWQgPT09IHRydWUpID8gdGhpcy55ZWFyIC0gdGhpcy5uTG9hZFllYXJzUHJldiA6IHRoaXMueWVhciAtIDMwO1xuICAgIGNvbnNvbGUubG9nKCdwcmV2JywgZW5kKTtcbiAgICB3aGlsZSAoc3RhcnQgPj0gZW5kKSB7XG4gICAgICAgIGlmICgkKFwiI3lcIiArIHN0YXJ0KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHZhciBodG1sID0gdGhpcy5nZXRZZWFySHRtbChzdGFydCk7XG4gICAgICAgICAgICAkKFwiI01HX0RhdGVfeWVhciAuc2Nyb2xsZXJcIikucHJlcGVuZChodG1sKTtcbiAgICAgICAgfVxuICAgICAgICBzdGFydC0tO1xuICAgIH1cbiAgICB3aGlsZSAoJChcIiN5XCIgKyBzdGFydCkubGVuZ3RoID4gMCkge1xuICAgICAgICAkKFwiI3lcIiArIHN0YXJ0KS5yZW1vdmUoKTtcbiAgICAgICAgc3RhcnQtLTtcbiAgICB9XG59O1xubWdkYXRlLnByb3RvdHlwZS5sb2FkTmV4dFllYXJzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdGFydCA9IHRoaXMueWVhciArIDE7XG4gICAgdmFyIGVuZCA9ICh0aGlzLnF1aWNrTG9hZCA9PT0gdHJ1ZSkgPyB0aGlzLnllYXIgKyB0aGlzLm5Mb2FkWWVhcnNOZXh0IDogdGhpcy55ZWFyICsgMzA7XG4gICAgY29uc29sZS5sb2coJ25leHQnLCBlbmQpO1xuICAgIHdoaWxlIChzdGFydCA8PSBlbmQpIHtcbiAgICAgICAgaWYgKCQoXCIjeVwiICsgc3RhcnQpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdmFyIGh0bWwgPSB0aGlzLmdldFllYXJIdG1sKHN0YXJ0KTtcbiAgICAgICAgICAgICQoXCIjTUdfRGF0ZV95ZWFyIC5zY3JvbGxlclwiKS5hcHBlbmQoaHRtbCk7XG4gICAgICAgIH1cbiAgICAgICAgc3RhcnQrKztcbiAgICB9XG4gICAgd2hpbGUgKCQoXCIjeVwiICsgc3RhcnQpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgJChcIiN5XCIgKyBzdGFydCkucmVtb3ZlKCk7XG4gICAgICAgIHN0YXJ0Kys7XG4gICAgfVxufTtcblxubWdkYXRlLnByb3RvdHlwZS5nZXRTY3JvbGxWYWx1ZSA9IGZ1bmN0aW9uIChpZCkge1xuXG4gICAgdmFyIGVsZW1lbnQgPSAkKFwiI1wiICsgaWQpO1xuICAgIHZhciBzY3JvbGxUYXJnZXQgPSBlbGVtZW50LnByZXYoKS5wcmV2KCk7XG4gICAgdmFyIGNvbnQgPSBlbGVtZW50LnBhcmVudCgpO1xuXG4gICAgdmFyIHNjcm9sbFZhbHVlID0gY29udC5zY3JvbGxUb3AoKSArIHNjcm9sbFRhcmdldC5wb3NpdGlvbigpLnRvcDtcblxuICAgIHJldHVybiBzY3JvbGxWYWx1ZTtcbn07XG5tZ2RhdGUucHJvdG90eXBlLmdldFNjcm9sbFZhbHVlRWwgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuXG4gICAgdmFyIHNjcm9sbFRhcmdldCA9IGVsZW1lbnQucHJldigpLnByZXYoKTtcbiAgICB2YXIgY29udCA9IGVsZW1lbnQucGFyZW50KCk7XG5cbiAgICB2YXIgc2Nyb2xsVmFsdWUgPSBjb250LnNjcm9sbFRvcCgpICsgc2Nyb2xsVGFyZ2V0LnBvc2l0aW9uKCkudG9wO1xuXG4gICAgcmV0dXJuIHNjcm9sbFZhbHVlO1xufTtcbm1nZGF0ZS5wcm90b3R5cGUuZXZlbnRzID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICQoXCJib2R5XCIpLmRlbGVnYXRlKFwiI01HX0RhdGVfZGF5IC5zY3JvbGxlciBkaXZcIiwgXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChzZWxmLmRheUFkanVzdCA9PT0gMSkge1xuICAgICAgICAgICAgc2VsZi5nb1RvRGF5KCQodGhpcykpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgJChcIiNNR19EYXRlX2RheSAuc2Nyb2xsZXJcIikuc2Nyb2xsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5pbmZpbml0ZVNjcm9sbERheSgpO1xuICAgIH0pO1xuICAgICQoXCJib2R5XCIpLmRlbGVnYXRlKFwiI01HX0RhdGVfbW9udGggLnNjcm9sbGVyIGRpdlwiLCBcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHNlbGYubW9udGhBZGp1c3QgPT09IDEpIHtcbiAgICAgICAgICAgIHNlbGYuZ29Ub01vbnRoKCQodGhpcykpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgJChcIiNNR19EYXRlX21vbnRoIC5zY3JvbGxlclwiKS5zY3JvbGwoZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmluZmluaXRlU2Nyb2xsTW9udGgoKTtcbiAgICB9KTtcbiAgICAkKFwiYm9keVwiKS5kZWxlZ2F0ZShcIiNNR19EYXRlX3llYXIgLnNjcm9sbGVyIGRpdlwiLCBcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHNlbGYueWVhckFkanVzdCA9PT0gMSkge1xuICAgICAgICAgICAgc2VsZi5nb1RvWWVhcigkKHRoaXMpLmF0dHIoJ2lkJykpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgJChcIiNNR19EYXRlX3llYXIgLnNjcm9sbGVyXCIpLnNjcm9sbChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuaW5maW5pdGVTY3JvbGxZZWFyKCk7XG4gICAgfSk7XG4gICAgJChcIiNNR19EYXRlX0J1dHRvbnMgLmNhbmNlbFwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5jYW5jZWwoKTtcbiAgICB9KTtcbiAgICAkKFwiI01HX0RhdGVfQnV0dG9ucyAuc2VuZFwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5zZW5kKClcbiAgICB9KTtcbn07XG5cbm1nZGF0ZS5wcm90b3R5cGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICQoXCIjTUdfRGF0ZV9CYWNrXCIpLmZhZGVPdXQoXCJmYXN0XCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgICB9KTtcbn07XG5tZ2RhdGUucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRheSA9IHRoaXMuZGF5O1xuICAgIHZhciBtb250aCA9IHRoaXMubW9udGg7XG4gICAgdmFyIHllYXIgPSB0aGlzLnllYXI7XG4gICAgaWYgKGRheSA8IDEwKSB7XG4gICAgICAgIGRheSA9ICcwJyArIGRheTtcbiAgICB9XG4gICAgaWYgKG1vbnRoIDwgMTApIHtcbiAgICAgICAgbW9udGggPSAnMCcgKyBtb250aDtcbiAgICB9XG4gICAgdmFyIGNvdW50WWVhciA9IHllYXIudG9TdHJpbmcoKS5sZW5ndGg7XG4gICAgdmFyIGRpZlllYXIgPSA0IC0gY291bnRZZWFyO1xuICAgIHdoaWxlIChkaWZZZWFyID4gMCkge1xuICAgICAgICB5ZWFyID0gJzAnICsgeWVhcjtcbiAgICAgICAgZGlmWWVhci0tO1xuICAgIH1cbiAgICB0aGlzLmVsZW1lbnQudmFsKHllYXIgKyAnLScgKyBtb250aCArICctJyArIGRheSk7XG4gICAgdGhpcy5jYW5jZWwoKTtcbn07XG5cbm1nZGF0ZS5wcm90b3R5cGUubW9udGhOYW1lcyA9IHtcbiAgICBwdDogWycnLCAnSmFuZWlybycsICdGZXZlcmVpcm8nLCAnTWFyw6dvJywgJ0FicmlsJywgJ01haW8nLCAnSnVuaG8nLCAnSnVsaG8nLCAnQWdvc3RvJywgJ1NldGVtYnJvJywgJ091dHVicm8nLCAnTm92ZW1icm8nLCAnRGV6ZW1icm8nXSxcbiAgICBlczogWycnLCAnRW5lcm8nLCAnRmVicmVybycsICdNYXJ6bycsICdBYnJpbCcsICdNYXlvJywgJ0p1bmlvJywgJ0p1bGlvJywgJ0Fnb3N0bycsICdTZXB0aWVtYnJlJywgJ09jdHVicmUnLCAnTm92aWVtYnJlJywgJ0RpY2llbWJyZSddLFxuICAgIGVuOiBbJycsICdKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ11cbn07XG5tZ2RhdGUucHJvdG90eXBlLnRleHQgPSB7XG4gICAgcHQ6IHtjYW5jZWw6ICdjYW5jZWxhcicsIHNlbmQ6ICdjb25maXJtYXInfSxcbiAgICBlczoge2NhbmNlbDogJ2NhbmNlbGFyJywgc2VuZDogJ2NvbmZpcm1hcid9LFxuICAgIGVuOiB7Y2FuY2VsOiAnY2FuY2VsJywgc2VuZDogJ2NvbmZpcm0nfSxcbn07XG5cbi8vbWdkYXRlLnByb3RvdHlwZS5tb250aE5hbWVzID0ge2VuZ1VTOiBbJycsJ0phbmVpcm8nLCAnRmV2ZXJlaXJvJywgJ01hcsOnbycsICdBYnJpbCcsICdNYWlvJywgJ0p1bmhvJywgJ0p1bGhvJywgJ0Fnb3N0bycsICdTZXRlbWJybycsICdPdXR1YnJvJywgJ05vdmVtYnJvJywgJ0RlemVtYnJvJ119O1xuLy9tZ2RhdGUucHJvdG90eXBlLnRleHQgPSB7ZW5nVVM6IHtjYW5jZWw6ICdjYW5jZWwnLCBzZW5kOiAnc2VuZCd9fTtcblxubWdkYXRlLnByb3RvdHlwZS5sYXN0RGF5TW9udGggPSBmdW5jdGlvbiAoeWVhciwgbW9udGgpIHtcbiAgICB2YXIgeWVhciA9IE51bWJlcih5ZWFyKTtcbiAgICB2YXIgbW9udGggPSBOdW1iZXIobW9udGgpO1xuICAgIHZhciBsYXN0RGF5ID0gbmV3IERhdGUoeWVhciwgbW9udGgpO1xuICAgIGxhc3REYXkuc2V0RGF0ZSgwKTtcbiAgICByZXR1cm4gbGFzdERheS5nZXRVVENEYXRlKCk7XG59O1xubWdkYXRlLnByb3RvdHlwZS52YWxpZERhdGUgPSBmdW5jdGlvbiAoZCwgbSwgeSkge1xuICAgIHZhciBkYXRlID0gbmV3IERhdGUoeSwgbSAtIDEsIGQpO1xuICAgIHJldHVybiAoZGF0ZS5nZXRGdWxsWWVhcigpID09IHkgJiYgZGF0ZS5nZXRNb250aCgpICsgMSA9PSBtICYmIGRhdGUuZ2V0RGF0ZSgpID09IGQpO1xufTtcbm1nZGF0ZS5wcm90b3R5cGUubG9hZEh0bWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoJChcIiNNR19EYXRlX0JhY2tcIikubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHZhciBtZ0RhdGVCYWNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgbWdEYXRlQmFjay5zZXRBdHRyaWJ1dGUoJ2lkJywgJ01HX0RhdGVfQmFjaycpO1xuICAgICAgICB2YXIgbWdEYXRlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgbWdEYXRlQ29udGFpbmVyLnNldEF0dHJpYnV0ZSgnaWQnLCAnTUdfRGF0ZV9Db250YWluZXInKTtcblxuICAgICAgICBtZ0RhdGVCYWNrLmFwcGVuZENoaWxkKG1nRGF0ZUNvbnRhaW5lcik7XG5cbiAgICAgICAgdmFyIG1nRGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIG1nRGF0ZS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ01HX0RhdGUnKTtcbiAgICAgICAgbWdEYXRlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnTUdfRGF0ZScpO1xuICAgICAgICB2YXIgbWdEYXRlQnV0dG9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIG1nRGF0ZUJ1dHRvbnMuc2V0QXR0cmlidXRlKCdpZCcsICdNR19EYXRlX0J1dHRvbnMnKTtcblxuICAgICAgICBtZ0RhdGVDb250YWluZXIuYXBwZW5kQ2hpbGQobWdEYXRlKTtcblxuICAgICAgICB2YXIgY2VsRGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY2VsRGF5LnNldEF0dHJpYnV0ZSgnaWQnLCAnTUdfRGF0ZV9jZWxkYXknKTtcbiAgICAgICAgdmFyIGRheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGRheS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ01HX0RhdGVfZGF5Jyk7XG4gICAgICAgIHZhciBzY3JvbGxlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHNjcm9sbGVyLmNsYXNzTmFtZSA9ICdzY3JvbGxlcic7XG4gICAgICAgIG1nRGF0ZS5hcHBlbmRDaGlsZChjZWxEYXkpO1xuICAgICAgICBjZWxEYXkuYXBwZW5kQ2hpbGQoZGF5KTtcbiAgICAgICAgZGF5LmFwcGVuZENoaWxkKHNjcm9sbGVyKTtcblxuICAgICAgICB2YXIgY2VsTW9udGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjZWxNb250aC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ01HX0RhdGVfY2VsbW9udGgnKTtcbiAgICAgICAgdmFyIG1vbnRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgbW9udGguc2V0QXR0cmlidXRlKCdpZCcsICdNR19EYXRlX21vbnRoJyk7XG4gICAgICAgIHZhciBzY3JvbGxlcjIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzY3JvbGxlcjIuY2xhc3NOYW1lID0gJ3Njcm9sbGVyJztcblxuICAgICAgICBtZ0RhdGUuYXBwZW5kQ2hpbGQoY2VsTW9udGgpO1xuICAgICAgICBjZWxNb250aC5hcHBlbmRDaGlsZChtb250aCk7XG4gICAgICAgIG1vbnRoLmFwcGVuZENoaWxkKHNjcm9sbGVyMik7XG5cbiAgICAgICAgdmFyIGNlbFllYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjZWxZZWFyLnNldEF0dHJpYnV0ZSgnaWQnLCAnTUdfRGF0ZV9jZWx5ZWFyJyk7XG4gICAgICAgIHZhciB5ZWFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgeWVhci5zZXRBdHRyaWJ1dGUoJ2lkJywgJ01HX0RhdGVfeWVhcicpO1xuICAgICAgICB2YXIgc2Nyb2xsZXIzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2Nyb2xsZXIzLmNsYXNzTmFtZSA9ICdzY3JvbGxlcic7XG5cbiAgICAgICAgbWdEYXRlLmFwcGVuZENoaWxkKGNlbFllYXIpO1xuICAgICAgICBjZWxZZWFyLmFwcGVuZENoaWxkKHllYXIpO1xuICAgICAgICB5ZWFyLmFwcGVuZENoaWxkKHNjcm9sbGVyMyk7XG5cbiAgICAgICAgdmFyIGNvdmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY292ZXIuc2V0QXR0cmlidXRlKCdpZCcsICdNR19EYXRlX2NvdmVyJyk7XG4gICAgICAgIGNvdmVyLmNsYXNzTmFtZSA9ICdNR19EYXRlJztcblxuICAgICAgICBtZ0RhdGUuYXBwZW5kQ2hpbGQoY292ZXIpO1xuICAgICAgICB2YXIgZDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgZDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgZDMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb3Zlci5hcHBlbmRDaGlsZChkMSk7XG4gICAgICAgIGNvdmVyLmFwcGVuZENoaWxkKGQyKTtcbiAgICAgICAgY292ZXIuYXBwZW5kQ2hpbGQoZDMpO1xuXG4gICAgICAgIG1nRGF0ZUNvbnRhaW5lci5hcHBlbmRDaGlsZChtZ0RhdGVCdXR0b25zKTtcblxuICAgICAgICB2YXIgaXBDYW5jZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgIGlwQ2FuY2VsLmlkID0gXCJNR19EYXRlX0NhbmNlbFwiO1xuICAgICAgICBpcENhbmNlbC50eXBlID0gXCJidXR0b25cIjtcbiAgICAgICAgaXBDYW5jZWwuY2xhc3NOYW1lID0gJ2NhbmNlbCc7XG4gICAgICAgIGlwQ2FuY2VsLnZhbHVlID0gc2VsZi50ZXh0W3RoaXMubGFuZ11bJ2NhbmNlbCddO1xuICAgICAgICB2YXIgaXBTZW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICBpcFNlbmQuaWQgPSBcIk1HX0RhdGVfU2VuZFwiO1xuICAgICAgICBpcFNlbmQudHlwZSA9IFwiYnV0dG9uXCI7XG4gICAgICAgIGlwU2VuZC5jbGFzc05hbWUgPSAnc2VuZCc7XG4gICAgICAgIGlwU2VuZC52YWx1ZSA9IHNlbGYudGV4dFt0aGlzLmxhbmddWydzZW5kJ107XG4gICAgICAgIG1nRGF0ZUJ1dHRvbnMuYXBwZW5kQ2hpbGQoaXBDYW5jZWwpO1xuICAgICAgICBtZ0RhdGVCdXR0b25zLmFwcGVuZENoaWxkKGlwU2VuZCk7XG5cbiAgICAgICAgJChcImJvZHlcIikuYXBwZW5kKG1nRGF0ZUJhY2spO1xuICAgIH1cbn07XG5cbiQuZm4ubWdkYXRlID0gZnVuY3Rpb24oKXtcbiAgICBuZXcgbWdkYXRlKCQodGhpcykpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBtZ2RhdGU7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ0RhdGUnOiAgIHJlcXVpcmUoJy4vZGF0ZScpLFxufTtcbiIsInZhciBDaGVja2VkID0gZnVuY3Rpb24oZWxlbWVudHMpe1xuXG4gICAgdGhpcy5lbGVtZW50cyA9IGVsZW1lbnRzO1xuICAgIHRoaXMubXNnID0gJ1NlbGVjaW9uZSB1bSBkb3MgY2FtcG9zJztcbn07XG5tb2R1bGUuZXhwb3J0cyA9IENoZWNrZWQ7XG5cbkNoZWNrZWQucHJvdG90eXBlLmlzVmFsaWQgPSBmdW5jdGlvbih2YWx1ZSwgY2Ipe1xuXG4gICAgdmFyIHJlcyA9IGZhbHNlO1xuICAgIGlmKHRoaXMuZWxlbWVudHMuZmlsdGVyKCc6Y2hlY2tlZCcpLnNpemUoKSA9PSAxKSByZXMgPSB0cnVlO1xuXG4gICAgY2IocmVzKTtcbn07XG4iLCJ2YXIgQ29udGFpbmVyID0gZnVuY3Rpb24oKXtcblxuICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IENvbnRhaW5lcjtcblxuQ29udGFpbmVyLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihlbGVtZW50KXtcblxuICAgIHRoaXMuZWxlbWVudHMucHVzaChlbGVtZW50KTtcbn07XG5cbkNvbnRhaW5lci5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uKGNiLCBvYmope1xuXG4gIHZhciBwcm9taXNlcyA9IFtdO1xuICBmb3IodmFyIGUgaW4gdGhpcy5lbGVtZW50cyl7XG4gICAgICB2YXIgZWxlbWVudCA9IHRoaXMuZWxlbWVudHNbZV07XG4gICAgICB2YXIgZGVmID0gbmV3ICQuRGVmZXJyZWQoZnVuY3Rpb24oZGVmKXtcbiAgICAgICAgICBlbGVtZW50LmlzVmFsaWQoZnVuY3Rpb24ocmVzKXsgZGVmLnJlc29sdmUocmVzKTsgfSwgb2JqKTtcbiAgICAgIH0pO1xuICAgICAgcHJvbWlzZXMucHVzaChkZWYpO1xuICB9XG5cbiAgJC53aGVuLmFwcGx5KHVuZGVmaW5lZCwgcHJvbWlzZXMpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7XG5cbiAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIGNiKGFyZ3MuaW5kZXhPZihmYWxzZSkgPCAwKTtcbiAgfSk7XG59O1xuXG5Db250YWluZXIucHJvdG90eXBlLmdldFZhbHVlcyA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIHZhbHVlcyA9IHt9O1xuICBmb3IodmFyIGUgaW4gdGhpcy5lbGVtZW50cyl7XG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRzW2VdO1xuICAgIHZhciBuYW1lICAgID0gISFlbGVtZW50Lm5hbWUgPyBlbGVtZW50Lm5hbWUgOiBlbGVtZW50LmF0dHIoJ25hbWUnKTtcbiAgICBpZighIW5hbWUpICB2YWx1ZXNbbmFtZV0gPSBlbGVtZW50LmdldFZhbHVlKCk7XG4gIH1cblxuICByZXR1cm4gdmFsdWVzO1xufTtcbiIsInZhciBEZWNvcmF0b3IgPSBmdW5jdGlvbihlbGVtZW50LCBtc2cpIHtcblxuICAgIGlmKGVsZW1lbnQudmFsaWRhdG9ycykgcmV0dXJuIGVsZW1lbnQ7XG5cbiAgICBlbGVtZW50LnZhbGlkYXRvcnMgPSBbXTtcbiAgICBlbGVtZW50LmZpbHRlcnMgICAgPSBbXTtcblxuICAgIGlmKCFlbGVtZW50Lm5hbWUpIGVsZW1lbnQubmFtZSA9IGVsZW1lbnQuYXR0cignbmFtZScpO1xuXG4gICAgZWxlbWVudC5hZGRWYWxpZGF0b3IgPSBmdW5jdGlvbih2YWxpZGF0b3Ipe1xuICAgICAgICB0aGlzLnZhbGlkYXRvcnMucHVzaCh2YWxpZGF0b3IpO1xuICAgIH07XG5cbiAgICBlbGVtZW50LmFkZEZpbHRlciA9IGZ1bmN0aW9uKGZpbHRlcil7XG4gICAgICAgIHRoaXMuZmlsdGVyLnB1c2goZmlsdGVyKTtcbiAgICB9O1xuXG4gICAgZWxlbWVudC5nZXRWYWx1ZSA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy52YWwoKS50cmltKCk7XG4gICAgICAgIGZvcih2YXIgZiBpbiB0aGlzLmZpbHRlcnMpe1xuXG4gICAgICAgICAgdmFyIGZpbHRlciA9IHRoaXMuZmlsdGVyc1tmXTtcbiAgICAgICAgICB2YXIgdmFsdWUgID0gZmlsdGVyLmZpbHRlcih2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcblxuICAgIGVsZW1lbnQuaXNWYWxpZCA9IGZ1bmN0aW9uKGNiLCBvYmopIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciByZXMgPSB0cnVlO1xuICAgICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuICAgICAgICBpZiAobXNnKSBtc2cudGV4dCgnJyk7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKTtcblxuICAgICAgICBmb3IodmFyIHYgaW4gdGhpcy52YWxpZGF0b3JzKXtcbiAgICAgICAgICAgIHZhciB2YWxpZGF0b3IgPSB0aGlzLnZhbGlkYXRvcnNbdl07XG4gICAgICAgICAgICB2YXIgZGVmID0gbmV3ICQuRGVmZXJyZWQoZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdG9yLmlzVmFsaWQodmFsdWUsIGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlcyAmJiBtc2cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZy50ZXh0KHZhbGlkYXRvci5tc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaW52YWxpZCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRlZi5yZXNvbHZlKHJlcyk7XG4gICAgICAgICAgICAgICAgfSwgb2JqKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJvbWlzZXMucHVzaChkZWYpO1xuICAgICAgICB9XG5cblxuICAgICAgICAkLndoZW4uYXBwbHkodW5kZWZpbmVkLCBwcm9taXNlcykucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGlmIChhcmdzLmluZGV4T2YoZmFsc2UpID49IDApIHtcbiAgICAgICAgICAgICAgICBjYihmYWxzZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNiKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGVsZW1lbnQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERlY29yYXRvcjtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnQ29udGFpbmVyJzogICAgICAgICByZXF1aXJlKCcuL2NvbnRhaW5lcicpLFxuICAnRGVjb3JhdG9yJzogICAgICAgICByZXF1aXJlKCcuL2RlY29yYXRvcicpLFxuICAnQ2hlY2tlZCc6ICAgICAgICAgICByZXF1aXJlKCcuL2NoZWNrZWQnKSxcbiAgJ05vdEVtcHR5JzogICAgICAgICAgcmVxdWlyZSgnLi9ub3RFbXB0eScpLFxuICAnTm90RW1wdHlEZXBlbmRlbnQnOiByZXF1aXJlKCcuL25vdEVtcHR5RGVwZW5kZW50JyksXG59O1xuIiwidmFyIE5vdEVtcHR5ID0gZnVuY3Rpb24oKXtcblxuICAgIHRoaXMubXNnID0gJ0NhbXBvIG9icmlnYXTDs3Jpbyc7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBOb3RFbXB0eTtcblxuTm90RW1wdHkucHJvdG90eXBlLmlzVmFsaWQgPSBmdW5jdGlvbih2YWx1ZSwgY2Ipe1xuXG4gICAgdmFyIHZhbHVlID0gdmFsdWUudHJpbSgpO1xuICAgIGlmKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PSAnJyl7XG4gICAgICAgIHJldHVybiBjYihmYWxzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNiKHRydWUpO1xufTtcbiIsInZhciBOb3RFbXB0eURlcGVuZGVudCA9IGZ1bmN0aW9uKGRlcCl7XG5cbiAgICB0aGlzLmRlcGVuZGVudCA9IGRlcDtcbiAgICB0aGlzLm1zZyA9ICdDYW1wbyBvYnJpZ2F0w7NyaW8nO1xufTtcbm1vZHVsZS5leHBvcnRzID0gTm90RW1wdHlEZXBlbmRlbnQ7XG5cbk5vdEVtcHR5RGVwZW5kZW50LnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24odmFsdWUsIGNiKXtcbiAgICBpZih2YWx1ZSA9PSAnJyl7XG4gICAgICAgIHZhciBkZXAgPSB0aGlzLmRlcGVuZGVudC52YWwoKTtcbiAgICAgICAgaWYoZGVwICE9ICcnKSByZXR1cm4gY2IoZmFsc2UpO1xuICAgIH1cblxuICAgIHJldHVybiBjYih0cnVlKTtcbn07XG4iLCJ2YXIgVmlldyA9IHJlcXVpcmUoJy4uL3ZpZXcnKTtcblxudmFyIGJhc2UgPSBmdW5jdGlvbigpe1xuXG4gIHRoaXMubGlzdCAgICAgID0gW107XG4gIHRoaXMubmFtZSAgICAgID0gISFuYW1lID8gbmFtZSA6ICcnO1xuICB0aGlzLmxhYmVsICAgICA9ICcnO1xuICB0aGlzLnZhbHVlICAgICA9IG51bGw7XG4gIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbn07XG5iYXNlLnByb3RvdHlwZSA9IG5ldyBWaWV3O1xuYmFzZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBiYXNlO1xubW9kdWxlLmV4cG9ydHMgPSBiYXNlO1xuXG5iYXNlLnByb3RvdHlwZS5zZXRMYWJlbCA9IGZ1bmN0aW9uKGxhYmVsKXtcbiAgdGhpcy5sYWJlbCA9IGxhYmVsO1xufTtcblxuYmFzZS5wcm90b3R5cGUudmFsID0gZnVuY3Rpb24odmFsdWUpe1xuXG4gIGlmKHZhbHVlID09PSB1bmRlZmluZWQpe1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9ZWxzZXtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5tYWtlSW5wdXRzKCk7XG4gIH1cbn07XG5cbmJhc2UucHJvdG90eXBlLmF0dHIgICAgICAgID0gZnVuY3Rpb24oKXsgLypmb3Igb3ZlcndyaXRlKi8gfTtcbmJhc2UucHJvdG90eXBlLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24oKXsgLypmb3Igb3ZlcndyaXRlKi8gfTtcbmJhc2UucHJvdG90eXBlLm1ha2VJbnB1dHMgID0gZnVuY3Rpb24oKXsgLypmb3Igb3ZlcndyaXRlKi8gfTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnQmFzZSc6ICAgICAgICAgIHJlcXVpcmUoJy4vYmFzZScpLFxuICAnUmFkaW8nOiAgICAgICAgIHJlcXVpcmUoJy4vcmFkaW8nKSxcbiAgJ1RleHRNdWx0aVJvdyc6ICByZXF1aXJlKCcuL3RleHRNdWx0aVJvdycpLFxufTtcbiIsInZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG5cbnZhciB2aWV3ID0gZnVuY3Rpb24obmFtZSl7XG5cbiAgdGhpcy5saXN0ICAgICAgPSBbXTtcbiAgdGhpcy5uYW1lICAgICAgPSAhIW5hbWUgPyBuYW1lIDogJyc7XG4gIHRoaXMudGl0bGUgICAgID0gJyc7XG4gIHRoaXMudmFsdWUgICAgID0gJyc7XG4gIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgdGhpcy50aXRsZV9jb250ICA9IENFKCdzcGFuJywgJ3dkbCcpO1xuICB0aGlzLnRpdGxlX2xhYmVsID0gQ0UoJ2xhYmVsJywgJ2l0ZW0nLCAnaXRlbS1pbnB1dCcsICdpdGVtLXN0YWNrZWQtbGFiZWwnKTtcbn07XG52aWV3LnByb3RvdHlwZSA9IG5ldyBCYXNlO1xudmlldy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSB2aWV3O1xubW9kdWxlLmV4cG9ydHMgPSB2aWV3O1xuXG52aWV3LnByb3RvdHlwZS5zZXRUaXRsZSA9IGZ1bmN0aW9uKHRpdGxlKXtcbiAgdGhpcy50aXRsZSA9IHRpdGxlO1xufTtcblxudmlldy5wcm90b3R5cGUubWFrZSA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIGRpdiA9IENFKCdkaXYnLCAnYm94Jyk7XG5cbiAgZGl2LmFwcGVuZCh0aGlzLnRpdGxlX2xhYmVsKTtcblxuICB0aGlzLnRpdGxlX2NvbnQudGV4dCh0aGlzLnRpdGxlKTtcbiAgdGhpcy50aXRsZV9sYWJlbC5hcHBlbmQodGhpcy50aXRsZV9jb250KTtcblxuICB0aGlzLm1lc3NhZ2UgPSBDRSgnc3BhbicsICd3ZGwnLCAnZXJyb3InKTtcbiAgdGhpcy50aXRsZV9sYWJlbC5hcHBlbmQodGhpcy5tZXNzYWdlKTtcblxuICB0aGlzLmNvbnRhaW5lciA9IENFKCdkaXYnLCAnYm94Jyk7XG4gIHRoaXMubWFrZUlucHV0cygpO1xuICBkaXYuYXBwZW5kKHRoaXMuY29udGFpbmVyKTtcblxuICByZXR1cm4gZGl2O1xufTtcblxudmlldy5wcm90b3R5cGUubWFrZUlucHV0cyA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLmNvbnRhaW5lci5odG1sKCcnKTtcblxuICBmb3IodmFyIHggaW4gdGhpcy5saXN0KXtcblxuICAgIHZhciBrZXkgICA9IHRoaXMubGlzdFt4XVswXTtcbiAgICB2YXIgbGFiZWwgPSB0aGlzLmxpc3RbeF1bMV07XG5cbiAgICB2YXIgaW5wdXQgPSBDRSgnaW5wdXQnKS5hdHRyKHt0eXBlOiAncmFkaW8nLCBuYW1lOiB0aGlzLm5hbWUsIHZhbHVlOiBrZXl9KTtcbiAgICBpbnB1dC5jc3Moe2Zsb2F0OiAncmlnaHQnLCB3aWR0aDogJzMwcHgnLCBoZWlnaHQ6ICcyZW0nLCBib3JkZXI6ICcwcHgnfSk7XG4gICAgdGhpcy5jb250YWluZXIuYXBwZW5kKENFKCdsYWJlbCcsICdpdGVtJykudGV4dChsYWJlbCkuYXBwZW5kKGlucHV0KSk7XG5cbiAgICBpZih0aGlzLnZhbHVlID09IGtleSkgaW5wdXQuYXR0cignY2hlY2tlZCcsICdjaGVja2VkJyk7XG4gIH1cblxuICB0aGlzLmNvbnRhaW5lci5jaGFuZ2UoZnVuY3Rpb24oKXsgc2VsZi52YWx1ZSA9IHNlbGYuY29udGFpbmVyLmZpbmQoJzpjaGVja2VkJykudmFsKCk7IH0pO1xufTtcblxudmlldy5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oa2V5LCBsYWJlbCl7XG4gIHRoaXMubGlzdC5wdXNoKFtrZXksIGxhYmVsXSk7XG59O1xuIiwidmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcblxudmFyIHZpZXcgPSBmdW5jdGlvbihuYW1lKXtcblxuICB0aGlzLmxpc3QgICAgICA9IFtdO1xuICB0aGlzLm5hbWUgICAgICA9ICEhbmFtZSA/IG5hbWUgOiAnJztcbiAgdGhpcy50aXRsZSAgICAgPSAnJztcbiAgdGhpcy52YWx1ZSAgICAgPSAnJztcbiAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICB0aGlzLnNlcXVlbmNlICA9IDA7XG59O1xudmlldy5wcm90b3R5cGUgPSBuZXcgQmFzZTtcbnZpZXcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gdmlldztcbm1vZHVsZS5leHBvcnRzID0gdmlldztcblxudmlldy5wcm90b3R5cGUuc2V0VGl0bGUgPSBmdW5jdGlvbih0aXRsZSl7XG4gIHRoaXMudGl0bGUgPSB0aXRsZTtcbn07XG5cbnZpZXcucHJvdG90eXBlLm1ha2UgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICB2YXIgZGl2ID0gQ0UoJ2RpdicsICdmb3JtLWdyb3VwJyk7XG4gIHZhciBsYWJlbCA9IENFKCdsYWJlbCcpLnRleHQodGhpcy50aXRsZSk7XG4gIGRpdi5hcHBlbmQobGFiZWwpO1xuXG4gIHRoaXMuaW5wdXQgPSBDRSgnaW5wdXQnLCAnZm9ybS1jb250cm9sJykuYXR0cih7dHlwZTogJ3RleHQnfSk7XG4gIHRoaXMuaW5wdXQuZm9jdXNvdXQoZnVuY3Rpb24oKXsgc2VsZi5hZGQuY2FsbChzZWxmKTsgfSk7XG4gIGRpdi5hcHBlbmQodGhpcy5pbnB1dCk7XG5cbiAgdGhpcy5saXN0ID0gQ0UoJ2RpdicsICdib3gnKTtcbiAgZGl2LmFwcGVuZCh0aGlzLmxpc3QpO1xuXG4gIHRoaXMub3V0cHV0ID0gQ0UoJ2lucHV0JykuYXR0cih7dHlwZTogJ2hpZGRlbicsIG5hbWU6IHRoaXMubmFtZX0pO1xuICBkaXYuYXBwZW5kKHRoaXMub3V0cHV0KTtcblxuICByZXR1cm4gZGl2O1xufTtcblxudmlldy5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oKXtcblxuICB2YXIgZm91bmQgPSBmYWxzZTtcblxuICB2YXIgdGV4dCAgPSB0aGlzLmlucHV0LnZhbCgpLnRyaW0oKTtcbiAgaWYodGV4dCA9PSAnJykgcmV0dXJuO1xuXG4gIHZhciByb3dpZCA9IHBhcnNlSW50KHRoaXMuaW5wdXQuYXR0cigncm93aWQnKSk7XG5cbiAgaWYoaXNOYU4ocm93aWQpKSByb3dpZCA9IC0tdGhpcy5zZXF1ZW5jZTtcblxuICB2YXIgdmFsdWVzID0gdGhpcy5nZXRWYWx1ZXMoKTtcbiAgZm9yKHZhciB2IGluIHZhbHVlcyl7XG4gICAgdmFyIHZhbHVlID0gdmFsdWVzW3ZdO1xuICAgIGlmKHZhbHVlLmlkID09IHJvd2lkKXtcbiAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgIHZhbHVlc1t2XS52YWx1ZSA9IHRleHQ7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZighZm91bmQpe1xuICAgIHZhbHVlcy5wdXNoKHtpZDogcm93aWQsIHZhbHVlOiB0ZXh0fSk7XG4gIH1cblxuICB0aGlzLnNldFZhbHVlcyh2YWx1ZXMpO1xuICB0aGlzLnJlZnJlc2godmFsdWVzKTtcbiAgdGhpcy5jbGVhcl9pbnB1dCgpO1xuICB0aGlzLmlucHV0LmZvY3VzKCk7XG59O1xuXG52aWV3LnByb3RvdHlwZS5jbGVhcl9pbnB1dCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuaW5wdXQudmFsKCcnKTtcbiAgdGhpcy5pbnB1dC5hdHRyKCdyb3dpZCcsICcnKTtcbn07XG5cbnZpZXcucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbih2YWx1ZXMpe1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICB0aGlzLmxpc3QuaHRtbCgnJyk7XG4gIHZhciBkaXYgPSBDRSgnZGl2JywgJ2JveCcpLmNzcyh7J2JvcmRlcic6ICcxcHggc29saWQgI2NjYycsICdtYXJnaW4tdG9wJzogJzVweCd9KTtcbiAgdGhpcy5saXN0LmFwcGVuZChkaXYpO1xuXG4gIHZhciB2YWx1ZXMgPSAhIXZhbHVlcyA/IHZhbHVlcyA6IHRoaXMuZ2V0VmFsdWVzKCk7XG5cbiAgaWYodmFsdWVzLmxlbmd0aCA9PSAwKXtcbiAgICBkaXYucmVtb3ZlKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9yKHZhciB2IGluIHZhbHVlcyl7XG4gICAgdmFyIHZhbHVlID0gdmFsdWVzW3ZdO1xuICAgIHZhciByb3cgICA9IENFKCdkaXYnLCAnYm94JykuY3NzKHsnYm9yZGVyLWJvdHRvbSc6ICcxcHggc29saWQgI2NjYycsICdwYWRkaW5nJzogJzVweCd9KS5hdHRyKCdyb3dpZCcsIHZhbHVlLmlkKTtcbiAgICBkaXYuYXBwZW5kKHJvdyk7XG4gICAgdmFyIHRleHQgID0gQ0UoJ3NwYW4nLCAnbGVmdCcpLnRleHQodmFsdWUudmFsdWUpO1xuICAgIHJvdy5hcHBlbmQodGV4dCk7XG5cbiAgICAoZnVuY3Rpb24odmFsdWUpe1xuXG4gICAgICB2YXIgZGVsICA9IENFKCdidXR0b24nLCAnYnRuJywgJ2J0bi1kYW5nZXInLCAnYnRuLXhzJywgJ3JpZ2h0JykuYXR0cih7dHlwZTogJ2J1dHRvbid9KS50ZXh0KCdBcGFnYXInKTtcbiAgICAgIGRlbC5jbGljayhmdW5jdGlvbigpeyBzZWxmLmRlbGV0ZS5jYWxsKHNlbGYsIHZhbHVlLmlkKSB9KTtcbiAgICAgIHJvdy5hcHBlbmQoZGVsKTtcblxuICAgICAgdmFyIGVkaXQgPSBDRSgnYnV0dG9uJywgJ2J0bicsICdidG4td2FybmluZycsICdidG4teHMnLCAncmlnaHQnKS5hdHRyKHt0eXBlOiAnYnV0dG9uJ30pLnRleHQoJ0VkaXRhcicpO1xuICAgICAgZWRpdC5jbGljayhmdW5jdGlvbigpeyBzZWxmLmVkaXQuY2FsbChzZWxmLCB2YWx1ZS5pZCkgfSk7XG4gICAgICByb3cuYXBwZW5kKGVkaXQpO1xuXG4gICAgfSkodmFsdWUpO1xuICB9O1xufTtcblxudmlldy5wcm90b3R5cGUuZWRpdCA9IGZ1bmN0aW9uKGlkKXtcblxuICB2YXIgdmFsdWVzID0gdGhpcy5nZXRWYWx1ZXMoKTtcbiAgdmFyIHNlbGYgICA9IHRoaXM7XG5cbiAgZm9yKHZhciB2IGluIHZhbHVlcyl7XG4gICAgdmFyIHZhbHVlID0gdmFsdWVzW3ZdO1xuICAgIGlmKHZhbHVlLmlkID09IGlkKXtcbiAgICAgIHNlbGYuaW5wdXQudmFsKHZhbHVlLnZhbHVlKTtcbiAgICAgIHNlbGYuaW5wdXQuYXR0cigncm93aWQnLCB2YWx1ZS5pZCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbn07XG5cbnZpZXcucHJvdG90eXBlLmRlbGV0ZSA9IGZ1bmN0aW9uKGlkKXtcblxuICB2YXIgdmFsdWVzID0gdGhpcy5nZXRWYWx1ZXMoKTtcbiAgdmFyIHNlbGYgICA9IHRoaXM7XG5cbiAgZm9yKHZhciB2IGluIHZhbHVlcyl7XG4gICAgdmFyIHZhbHVlID0gdmFsdWVzW3ZdO1xuICAgIGlmKHZhbHVlLmlkID09IGlkKXtcblxuICAgICAgdmFsdWVzLnNwbGljZSh2LCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XG4gIHRoaXMucmVmcmVzaCgpO1xufTtcblxudmlldy5wcm90b3R5cGUuZ2V0VmFsdWVzID0gZnVuY3Rpb24oKXtcblxuICB2YXIganNvbl9kYXRhID0gdGhpcy5vdXRwdXQudmFsKCk7XG4gIGlmKGpzb25fZGF0YSA9PSAnJykganNvbl9kYXRhID0gJ1tdJztcbiAgcmV0dXJuIEpTT04ucGFyc2UoanNvbl9kYXRhKTtcbn07XG5cbnZpZXcucHJvdG90eXBlLnNldFZhbHVlcyA9IGZ1bmN0aW9uKHZhbHVlcyl7XG5cbiAgdmFyIGpzb25fZGF0YSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlcyk7XG4gIHRoaXMub3V0cHV0LnZhbChqc29uX2RhdGEpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnVmlldyc6ICAgcmVxdWlyZSgnLi92aWV3JyksXG4gICdmaWVsZCc6ICByZXF1aXJlKCcuL2ZpZWxkL2luZGV4JyksXG59O1xuIiwidmFyIENFID0gZnVuY3Rpb24odGFnKXtcblxuICAgIHZhciBlbGVtZW50ID0gJChkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZykpO1xuICAgIGZvcih2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspe1xuICAgICAgICBlbGVtZW50LmFkZENsYXNzKGFyZ3VtZW50c1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50O1xufTtcbndpbmRvdy5DRSA9IENFO1xuXG52YXIgYmFzZSA9IGZ1bmN0aW9uKEMpe1xuXG4gICAgdGhpcy5wb3NfbWFrZSA9IFtdO1xuICAgIHRoaXMucHJlX21ha2UgPSBbXTtcbiAgICB0aGlzLkMgPSBDOyAvL0NvbnRyb2xsZXJcbn1cblxuYmFzZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnJlbmRlcigpO1xufTtcblxuYmFzZS5wcm90b3R5cGUubWFrZSAgICAgPSBmdW5jdGlvbigpe307XG5cbmJhc2UucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCl7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAkLmVhY2godGhpcy5wcmVfbWFrZSwgZnVuY3Rpb24oaywgdil7IHYuY2FsbChzZWxmKTsgfSk7XG4gICAgdmFyIHJlbmRlciA9IHRoaXMubWFrZSgpO1xuICAgICQuZWFjaCh0aGlzLnBvc19tYWtlLCBmdW5jdGlvbihrLCB2KXsgdi5jYWxsKHNlbGYpOyB9KTtcbiAgICByZXR1cm4gcmVuZGVyO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlO1xuIl19
