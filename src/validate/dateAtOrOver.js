var dateAtOrOver = function(date){

  this.date = date;
  this.msg  = 'A data deve ser igual ou superior a {0}'.format(date.toLocaleDateString());
};
module.exports = dateAtOrOver;

dateAtOrOver.prototype.isValid = function(value, cb){

  var value = new Date(value.split('-'));
  if(value.getTime() < this.date.getTime()) return cb(false);
  cb(true);
};
