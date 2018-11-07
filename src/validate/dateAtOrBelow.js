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
  if(value.today().getTime() > this.date.today().getTime()) return cb(false);
  cb(true);
};

/* Params ex: [-365] => 1 year ago or below
              [01/01/2018] => 01/01/2018 or below
*/
dateAtOrBelow.load = function(params){

  var defer = Q.defer();
  var first = params[0];
  var date  = new Date();

  if(!!first){
    
    if(typeof first == 'number'){
    
      first    = parseInt(first);
      date.setDate(date.getDate() + first);

    }else{
    
      date = new Date(first.replace(/-/g, '/'));
    }
  }

  var validator = new dateAtOrBelow(date);
  defer.resolve(date);

  return defer.promise;
};
