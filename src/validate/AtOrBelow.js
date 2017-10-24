var Base = require('./base');

var atOrBelow = function(limit){

  this.limit = limit
  this.msg  = 'Valor superior ao limite de ' + this.limit;
};
atOrBelow.prototype = new Base;
atOrBelow.prototype.constructor = atOrBelow;
module.exports = atOrBelow;

atOrBelow.prototype.isValid = function(value, cb){
  
  if(!value) return cb(true);

  if(value > this.limit) return cb(false);
  cb(true);
};
