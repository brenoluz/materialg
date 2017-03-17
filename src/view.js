var jquery = CE('jquery');

var CE = function(tag){

    var element = jquery(document.createElement(tag));
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
