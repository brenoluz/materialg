var Base = require('./base');
var Q    = require('q');

var atOrBelow = function(limit){

  this.limit = limit
  this.message   = 'Valor superior ao limite de ' + this.limit;
};
atOrBelow.prototype = new Base;
atOrBelow.prototype.constructor = atOrBelow;
module.exports = atOrBelow;

atOrBelow.prototype.isValid = function(value, cb){
  
  if(!value) return cb(true);

  if(value > this.limit) return cb(false);
  cb(true);
};

atOrBelow.load = function(params){
    
  var defer = Q.defer();
  var first = params[0];

  if(typeof first != 'number'){
    defer.reject(first + ' is not a number');

  }else{
    
    first = parseInt(first);
    var validator = new atOrBelow(first);
    defer.resolve(validator);
  }

  return defer.resolve;
};
