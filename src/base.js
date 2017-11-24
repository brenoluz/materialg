var Q = require('q');

var base = function(){};
module.exports = base;

base.prototype.make = function(){
  
  var def = Q.defer();
  def.resolve();
  return def.promise;
};

