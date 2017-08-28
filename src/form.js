var Base = require('./base');
var Q    = require('q');

var form = function(){
  
  this.elements   = [];
  this.validators = [];
};
form.prototype = new Base;
form.prototype.constructor = form;
module.exports = form;

form.prototype.append = function(element){

  this.elements.push(element);
};

form.prototype.addValidator = function(validator){

  this.validators.push(validator);
};

form.prototype.isValidForm = function(cb){

  var values  = this.getValues();
  var clone_v = [];

  for(var v in this.validators) clone_v.push(this.validators[v]);
  clone_v.reverse();

  var first_validator = clone_v.pop();
  
  var func_v = function(validator){
  
    //ended without error
    if(!validator) return cb(true);

    validator.isValid(values, function(res){

      //stop when false
      if(!res) return cb(false);
      var next_validator = clone_v.pop();

      return func_v(next_validator);
    });
  };

  return func_v(first_validator);
};

form.prototype.isValid = function(cb, obj){
  
  var self = this;

  var promises = [];
  for(var e in this.elements){
    var element = this.elements[e];
    var def = Q.defer();
    (function(elem, deff, o){
      elem.isValid(deff.resolve, o);
    })(element, def, obj);
    promises.push(def.promise);
  }

  Q.all(promises).then(function(data){

    var args = Array.prototype.slice.call(data);
    var res  = args.indexOf(false) < 0;
    if(!res) return cb(false);
    return self.isValidForm(cb);
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
