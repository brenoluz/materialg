var Base = require('./base');

var NotEmptyDependent = function(dep){

  this.dependent = dep;
  this.msg = 'Campo obrigatório';
};
NotEmptyDependent.prototype = new Base;
NotEmptyDependent.prototype.constructor = NotEmptyDependent;
module.exports = NotEmptyDependent;

NotEmptyDependent.prototype.isValid = function(value, cb){

  if(value == ''){
      var dep = this.dependent.val();
      if(dep != '') return cb(false);
  }

  return cb(true);
};
