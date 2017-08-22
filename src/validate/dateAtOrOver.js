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
  if(value.getTime() < this.date.getTime()) return cb(false);
  cb(true);
};
