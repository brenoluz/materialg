var Base = require('./base');
var Q    = require('q');

var dateAtOrOver = function(date){

  this.date = !!date ? date : new Date();
  this.message  = 'A data deve ser igual ou superior a {0}'.format(date.toLocaleDateString());
};
dateAtOrOver.prototype = new Base;
dateAtOrOver.prototype.constructor = dateAtOrOver;
module.exports = dateAtOrOver;

dateAtOrOver.prototype.isValid = function(value, cb){

  if(value instanceof Date && value.toString() == 'Invalid Date'){
    cb(true);
    return;
  }

  if(!value){
    cb(true);
    return;
  }

  var value = value instanceof Date ? value : new Date(value.replace(/-/g, '/'));
  var clone = new Date(this.date);
  clone.setDate(clone.getDate() - 1)
  if(value.getTime() > clone.getTime()) return cb(true);
  cb(false);
};

/* Params ex: [-365] => 1 year ago or over 
              [01/01/2018] => 01/01/2018 or over
*/
dateAtOrOver.load = function(params){

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

  var validator = new dateAtOrOver(date);
  defer.resolve(validator);

  return defer.promise;
};
