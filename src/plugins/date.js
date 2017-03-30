var mgdate = function(element){
    var self = this;
    var lang = ($(element).data("lang") !== undefined)? $(element).data("lang") : 'pt' ;
    $(element).on("click", function(){
        var val = $(this).val();
        $(this).attr('readonly', true);
        var day = '', month = '', year = '';
        var arrayValue = val.split('-')
        var valid = self.validDate(arrayValue[2],arrayValue[1],arrayValue[0])
        if(val === undefined || val === '' || valid === false){
            var today = new Date();
            day = today.getDate();
            month = today.getMonth()+1;
            year = today.getFullYear();
        }else{
            day = Number(arrayValue[2]);
            month = Number(arrayValue[1]);
            year = Number(arrayValue[0]);
        }
        self.init($(this),day,month,year,lang);
    });
};

mgdate.prototype.init = function(element, day, month, year, lang){
    this.element = element;
    this.day   = day;
    this.month = month;
    this.year  = year;

    this.lang = lang;
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

}
mgdate.prototype.setDay = function(element){
    if(element.length > 0){
        this.jumpToDay(element);
    }else{
        $("#MG_Date_day .scroller").html('');
        var selected = this.loadDays();
        this.jumpToDay(selected);
    }
}
mgdate.prototype.goToDay = function(element, velocity){

    if(velocity === undefined){
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
    cont.animate({scrollTop: scrollValue}, velocity, function(){

        if(element.data('type') === 'f'){
            var realId = "d" + self.day;
            self.jumpToDay(realId);
        }
        setTimeout(function(){ self.dayAdjust = 1; }, 300);

    });
}
mgdate.prototype.jumpToDay = function(el){
    this.day = el.data('day');

    var cont = el.parent();
    var newValue = this.getScrollValueEl(el);

    cont.scrollTop(newValue);
}
mgdate.prototype.getDayHtml = function(day, selected){

    var div = document.createElement("div");
    $(div).attr("data-day", day);
    if(selected === true){
         $(div).attr("id", 'dSelected');
    }
    if(day > 28){
        $(div).attr("class", 'd'+day);
    }
    var nDay = (day < 10)? '0' + day: day;
    var t = document.createTextNode(nDay);
    div.appendChild(t);

    return $(div);
}
mgdate.prototype.reloadDays = function(){
    var lastDay = this.lastDayMonth(this.year, this.month);
    var dif = lastDay - this.day;
    el = $("#dSelected");
    if(dif < 0){
        for(var i = 0; i > dif; i--){
            prev = el.prev();
            el = prev;
        }
    }
    this.goToDay(el);
    $("#MG_Date_day .scroller").html('');
    this.loadDays();
}
mgdate.prototype.loadDays = function(){
    var div = this.getDayHtml(this.day,true);
    if($("#dSelected").length === 0){
        $("#MG_Date_day .scroller").append(div);
    }
    var lastDay = this.lastDayMonth(this.year, this.month)
    this.loadPrevDays(lastDay);
    this.loadNextDays(lastDay);

    return $('#dSelected');
}
mgdate.prototype.loadPrevDays = function(lastDay){

    var selected = $("#dSelected");
    var tDay = this.day - 1;
    var prev = selected.prev();
    for(var i = 0; i < 60; i++){
        if(tDay === 0){
            tDay = lastDay;
        }
        var html = this.getDayHtml(tDay);
        if(prev.length === 0){
            $("#MG_Date_day .scroller").prepend(html);
        }else{
            prev.html(html.html())
        }
        prev = prev.prev();
        --tDay;
    }

    var i2 = 0;
    while(prev.length != 0){
        if(tDay === 0){
            tDay = lastDay;
        }
        var tPrev = prev.prev();
        prev.remove();
        prev = tPrev;
        --tDay;
    }

}


mgdate.prototype.loadNextDays = function(lastDay){

    var selected = $("#dSelected");
    var tDay = this.day + 1;
    var next = selected.next();
    for(var i = 0; i < 60; i++){
        if(tDay === lastDay + 1){
            tDay = 1;
        }

        if(next.length === 0){
            var html = this.getDayHtml(tDay);
            $("#MG_Date_day .scroller").append(html);

        }
        next = next.next();
        ++tDay;
    }

    while(next.length != 0){
        if(tDay === lastDay + 1){
            tDay = 1;
        }
        var tNext = next.next();
        next.remove();
        next = tNext;
        ++tDay;
    }

}
mgdate.prototype.infiniteScrollDay = function(){
    var cont = $("#MG_Date_day .scroller");
    var wait = 250;


    if(this.dayAdjust === 1){
        clearTimeout($.data(this, 'scrollTimer'));
        var self = this;
        $.data(this, 'scrollTimer', setTimeout(function() {
            self.adjustScrollDay();
        }, wait));
    }

}
mgdate.prototype.adjustScrollDay = function(){

    if(this.dayAdjust === 1){

        var self = this;
        var cel = $("#MG_Date_day .scroller div:nth-child(1)");;
        var halfCelHeight = cel.height() / 2;

        $("#MG_Date_day .scroller div").each(function(){
            //if($(this).css('display') === 'block'){
                if($(this).position().top > -halfCelHeight){
                    var correct = $(this).next().next();
                    self.goToDay(correct, 50)
                    return false;

                }
            //}
        });
    }
}
mgdate.prototype.setMonth = function(element){
    if(element.length > 0){
        this.jumpToMonth(element);
    }else{
        $("#MG_Date_month .scroller").html('');
        var selected = this.loadMonths();
        this.jumpToMonth(selected);
    }
}
mgdate.prototype.goToMonth = function(element, velocity){

    var elYear = Number(element.data("year"));

    if(velocity === undefined){
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
    cont.animate({scrollTop: scrollValue}, velocity, function(){
        setTimeout(function(){
            self.monthAdjust = 1;

        }, 300);

    });

}
mgdate.prototype.jumpToMonth = function(el){
    this.month = el.data('month');
    var cont = el.parent();
    var newValue = this.getScrollValueEl(el);

    cont.scrollTop(newValue);
}
mgdate.prototype.infiniteScrollMonth = function(){
    var cont = $("#MG_Date_month .scroller");
    var wait = 250;

    if(this.monthAdjust === 1){
        clearTimeout($.data(this, 'scrollTimer'));
        var self = this;
        $.data(this, 'scrollTimer', setTimeout(function() {
            self.adjustScrollMonth();
        }, wait));
    }

}
mgdate.prototype.adjustScrollMonth = function(){

    if(this.monthAdjust === 1){

        var self = this;
        var cel = $("#MG_Date_month .scroller div:nth-child(1)");;
        var halfCelHeight = cel.height() / 2;
        $("#MG_Date_month .scroller div").each(function(){

            if($(this).position().top > -halfCelHeight){
                var correct = $(this).next().next();
                self.goToMonth(correct, 50)
                return false;

            }
        });
    }
}

mgdate.prototype.loadMonths = function(){

    var div = this.getMonthHtml(this.month, this.year,true);
    if($("#mSelected").length === 0){
        $("#MG_Date_month .scroller").append(div);
    }
    this.loadPrevMonths();
    this.loadNextMonths();

    return $('#mSelected');
}
mgdate.prototype.getMonthHtml = function(month, year, selected){
    if(month === 0){
        month = 12;
        --year;
    }

    var div = document.createElement("div");
    div.setAttribute("data-month", month);

    if(selected !== undefined){
        div.setAttribute("id", 'mSelected');
    }

    var nMonth = this.monthNames[this.lang][month];
    var t = document.createTextNode(nMonth);
    div.appendChild(t);

    return $(div);
}
mgdate.prototype.loadPrevMonths = function(){

    var selected = $("#mSelected");
    var tMonth = this.month - 1;
    var tYear = this.year;

    var prev = selected.prev();
    for(var i = 0; i < 60; i++){
        if(tMonth === 0){
            tMonth = 12;
            tYear--;
        }

        if(prev.length === 0){

            var html = this.getMonthHtml(tMonth, tYear);
            $("#MG_Date_month .scroller").prepend(html);

        }
        prev = prev.prev();
        --tMonth;
    }

    while(prev.length != 0){
        if(tMonth === 0){
            tMonth = 12;
        }
        var tPrev = prev.prev();
        prev.remove();
        prev = tPrev;
        --tMonth;
    }
}


mgdate.prototype.loadNextMonths = function(){
    var selected = $("#mSelected");
    var tMonth = this.month + 1;
    var tYear = this.year;

    var next = selected.next();
    for(var i = 0; i < 60; i++){
        if(tMonth === 13){
            tMonth = 1;
        }

        if(next.length === 0){

            var html = this.getMonthHtml(tMonth, tYear);
            $("#MG_Date_month .scroller").append(html);

        }
        next = next.next();
        ++tMonth;
    }

    while(next.length != 0){
        if(tMonth === 13){
            tMonth = 1;
        }
        var tNext = next.next();
        next.remove();
        next = tNext;
        ++tMonth;

    }
}


mgdate.prototype.setYear = function(number){
    this.jumpToYear("y"+number);
}
mgdate.prototype.goToYear = function(id, velocity){

    var element = $("#"+id);
    if(velocity === undefined){
        velocity = 200;
    }
    var cont = element.parent();
    var prevYear = this.year;
    this.yearAdjust = 0;
    this.year = Number(element.html());
    this.reloadDays();
    this.loadYears();

    scrollValue = this.getScrollValue(id);
    var self = this;
    cont.animate({scrollTop: scrollValue}, velocity, function(){
        setTimeout(function(){
            self.yearAdjust = 1;
        }, 300);

    });
    maxScroll = cont.prop("scrollHeight")

}
mgdate.prototype.jumpToYear = function(id){
    var el = $("#"+id);
    this.year = Number(el.html());
    var cont = el.parent();
    var newValue = this.getScrollValue(id);

    cont.scrollTop(newValue);
}
mgdate.prototype.infiniteScrollYear = function(){
    var cont = $("#MG_Date_year .scroller");
    var wait = 250;

    if(this.yearAdjust === 1){
        clearTimeout($.data(this, 'scrollTimer'));
        var self = this;
        $.data(this, 'scrollTimer', setTimeout(function() {
            self.adjustScrollYear();
        }, wait));
    }

}
mgdate.prototype.adjustScrollYear = function(){

    if(this.yearAdjust === 1){

        var self = this;
        var cel = $("#y"+this.year);
        var halfCelHeight = cel.height() / 2;
        $("#MG_Date_year .scroller div").each(function(){

            if($(this).position().top > -halfCelHeight){
                var correct = $(this).next().next();
                self.goToYear(correct.attr('id'), 50)
                return false;

            }
        });
    }
}

mgdate.prototype.loadYears = function(){
    this.loadPrevYears();
    if($("#y"+this.year).length === 0){
        var html = this.getYearHtml(this.year);
        $("#MG_Date_year .scroller").append(html);
    }
    this.loadNextYears();

}
mgdate.prototype.getYearHtml = function(year){
    var div = document.createElement("div");
    $(div).attr("y" + year)
    var t = document.createTextNode(year);
    div.appendChild(t);
    div.setAttribute('id', 'y'+year);
    return div;
}
mgdate.prototype.loadPrevYears = function(){
    var start = this.year - 1;
    var end = this.year - 30;
    while(start >= end){
        if($("#y"+start).length === 0){
            var html = this.getYearHtml(start);
            $("#MG_Date_year .scroller").prepend(html);
        }
        start--;
    }
    while($("#y"+start).length > 0){
        $("#y"+start).remove();
        start--;
    }
}
mgdate.prototype.loadNextYears = function(){
    var start = this.year + 1;
    var end = this.year + 30;
    while(start <= end){
        if($("#y"+start).length === 0){
            var html = this.getYearHtml(start);
            $("#MG_Date_year .scroller").append(html);
        }
        start++;
    }
    while($("#y"+start).length > 0){
        $("#y"+start).remove();
        start++;
    }
}

mgdate.prototype.getScrollValue = function(id){

    var element = $("#"+id);
    var scrollTarget = element.prev().prev();
    var cont = element.parent();

    var scrollValue = cont.scrollTop() + scrollTarget.position().top;

    return scrollValue;
}
mgdate.prototype.getScrollValueEl = function(element){

    var scrollTarget = element.prev().prev();
    var cont = element.parent();

    var scrollValue = cont.scrollTop() + scrollTarget.position().top;

    return scrollValue;
}
mgdate.prototype.events = function(id){
    var self = this;
    $("body").delegate("#MG_Date_day .scroller div","click",function() {
        if(self.dayAdjust === 1){
            self.goToDay($(this));
        }
    });
    $("#MG_Date_day .scroller").scroll(function() {
        self.infiniteScrollDay();
    });
    $("body").delegate("#MG_Date_month .scroller div","click",function() {
        if(self.monthAdjust === 1){
            self.goToMonth($(this));
        }
    });
    $("#MG_Date_month .scroller").scroll(function() {
        self.infiniteScrollMonth();
    });
    $("body").delegate("#MG_Date_year .scroller div","click",function() {
        if(self.yearAdjust === 1){
            self.goToYear($(this).attr('id'));
        }
    });
    $("#MG_Date_year .scroller").scroll(function() {
        self.infiniteScrollYear();
    });
    $("#MG_Date_Buttons .cancel").on("click",function() {
        self.cancel();
    });
    $("#MG_Date_Buttons .send").on("click",function() {
        self.send()
    });
}

mgdate.prototype.cancel = function(){
    $("#MG_Date_Back").fadeOut("fast", function(){
        $(this).remove();
    });
};
mgdate.prototype.send = function(){
    var day = this.day;
    var month = this.month;
    var year = this.year;
    if(day < 10){
        day = '0'+day;
    }
    if(month < 10){
        month = '0'+month;
    }
    var countYear = year.toString().length;
    var difYear = 4 - countYear;
    while (difYear > 0){
        year = '0'+year;
        difYear--;
    }
    this.element.val(year+'-'+ month +'-'+day);
    this.cancel();
};

mgdate.prototype.monthNames = {
    pt: ['','Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    es: ['','Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    en: ['','January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};
mgdate.prototype.text = {
    pt: {cancel: 'cancelar', send: 'confirmar'},
    es: {cancel: 'cancelar', send: 'confirmar'},
    en: {cancel: 'cancel', send: 'confirm'},
};

//mgdate.prototype.monthNames = {engUS: ['','Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']};
//mgdate.prototype.text = {engUS: {cancel: 'cancel', send: 'send'}};

mgdate.prototype.lastDayMonth = function(year, month){
    var year = Number(year);
    var month = Number(month);
    var lastDay = new Date(year, month);
    lastDay.setDate(0);
    return lastDay.getUTCDate();
};
mgdate.prototype.validDate = function(d, m, y){
    var date = new Date(y, m - 1, d);
    return (date.getFullYear() == y && date.getMonth() + 1 == m && date.getDate() == d);
}
mgdate.prototype.loadHtml = function(){
    self = this;

    if($("#MG_Date_Back").length === 0){
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
        ipCancel.id   = "MG_Date_Cancel";
        ipCancel.type = "button";
        ipCancel.className = 'cancel';
        ipCancel.value = self.text[this.lang]['cancel'];
        var ipSend = document.createElement("input");
        ipSend.id   = "MG_Date_Send";
        ipSend.type = "button";
        ipSend.className = 'send';
        ipSend.value = self.text[this.lang]['send'];
        mgDateButtons.appendChild(ipCancel);
        mgDateButtons.appendChild(ipSend);

        $("body").append(mgDateBack);
    }
}

$.fn.mgdate = function(){
    new mgdate($(this));
    return this;
};

module.exports = mgdate;
