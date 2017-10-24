var Base = require('./base');

var dateAtOrOver = function(date){

  this.date = date;
  this.msg  = 'A data deve ser igual ou superior a {0}'.format(date.toLocaleDateString());
};
dateAtOrOver.prototype = new Base;
dateAtOrOver.prototype.constructor = dateAtOrOver;
module.exports = dateAtOrOver;

dateAtOrOver.prototype.isValid = function(value, cb){

  var value = value instanceof Date ? value : new Date(value.split('-'));
  var clone = new Date(this.date);
  clone.setDate(clone.getDate() - 1)
  if(value.getTime() > clone.getTime()) return cb(true);
  cb(false);
};
