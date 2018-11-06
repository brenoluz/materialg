var Base = require('./base');

var atOrOver = function(limit){

  this.limit = limit
  this.message  = 'Valor inferior ao limite de ' + this.limit;
};
atOrOver.prototype = new Base;
atOrOver.prototype.constructor = atOrOver;
module.exports = atOrOver;

atOrOver.prototype.isValid = function(value, cb){

  if(!value) return cb(true);

  if(value < this.limit) return cb(false);
  cb(true);
};
