const Base  = require('./base');
const tools = require('../tools');

let date = function(format){

  this.format = format;
  
  this.message = 'Data inválida';
}
date.prototype = new Base;
date.prototype.constructor = date;
module.exports = date;

date.prototype.isValid = function(value, cb){

  if(!value){
    cb(true);
    return;
  }

  if(!(value instanceof Date)){
    if(!!this.format){
      value = tools.transform_date(value, from_format, 'aaaa/MM/dd');
      value = new Date(value);
    }else{
      value = new Date(value.replace(/-/g, '/'));
    }
  }

  cb(value.toString() != 'Invalid Date');
}
