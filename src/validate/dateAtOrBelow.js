var Base = require('./base');
const tools = require('../tools');

var dateAtOrBelow = function(date, format){

  this.date = date;
  this.message  = 'Data futura inválida';
  this.format  = format;
  this.can_transform = true;
};
dateAtOrBelow.prototype = new Base;
dateAtOrBelow.prototype.constructor = dateAtOrBelow;
module.exports = dateAtOrBelow;

dateAtOrBelow.prototype.disable_transform = function(){

  this.can_transform = false;
}

dateAtOrBelow.prototype.isValid = function(value, cb){

  let is_valid = this.isValidSync(value);
  return Promise.resolve(is_valid);
};

dateAtOrBelow.prototype.isValidSync = function(value){

  if(!value){
    return true; 
  }

  if(!this.format){
    this.format = tools.get_date_format();
  }

  if(!(value instanceof Date)){

    if(value.length != this.format.length){
      return false;
    }
  
    if(this.can_transform){
      value = tools.transform_date(value, this.format, 'aaaa/MM/dd');
    }

    value = new Date(value);
  }

  //não é tarefa dessa validação verificar a formatação
  if(value.toString() != 'Invalid Date'){
    return true;
  }

  if(value.today().getTime() > this.date.today().getTime()){
    return false;
  }

  return true;
}

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
