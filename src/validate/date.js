const Base  = require('./base');
const tools = require('../tools');

let date = function(format){

  this.format  = format;
  this.message = 'Data inválida';
  this.can_transform = true;
}
date.prototype = new Base;
date.prototype.constructor = date;
module.exports = date;

date.prototype.disable_transform = function(){

  this.can_transform = false;
}

date.prototype.isValid = function(value, cb){

  let is_valid = this.isValidSync(value);
  return cb(is_valid);
}

date.prototype.isValidSync = function(value, transformed){

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

  return (value.toString() != 'Invalid Date');
}
