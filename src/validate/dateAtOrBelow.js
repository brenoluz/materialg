var Base = require('./base');

var dateAtOrBelow = function(date){

  this.date = date;
  this.msg  = 'Data futura inválida';
};
dateAtOrBelow.prototype = new Base;
dateAtOrBelow.prototype.constructor = dateAtOrBelow;
module.exports = dateAtOrBelow;

dateAtOrBelow.prototype.isValid = function(value, cb){

  var value = value instanceof Date ? value : new Date(value.split('-'));
  if(value.getTime() > this.date.getTime()) return cb(false);
  cb(true);
};
