var Base = require('./base');

var form = function(){};
form.prototype = new Base;
form.prototype.constructor = form;
module.exports = form;

form.prototype.elements = [];

form.prototype.append = function(element){

    this.elements.push(element);
};

form.prototype.isValid = function(cb, obj){

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

form.prototype.setValues = function(values){

  for(var e in this.elements){
    var element = this.elements[e];
    var name    = !!element.name ? element.name : element.attr('name');
    if(!!name && values.hasOwnProperty(name)) element.val(values[name]);
  }
};

form.prototype.getValues = function(){

  var values = {};
  for(var e in this.elements){
    var element = this.elements[e];
    var name    = !!element.name ? element.name : element.attr('name');
    if(!!name)  values[name] = element.getValue();
  }

  return values;
};
