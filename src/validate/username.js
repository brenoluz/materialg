const Base = require('./base');

const username = function(){
  this.message = 'Formato inválido';

  Base.constructor.call(this);
}

username.prototype = new Base;
username.prototype.constructor = username;
module.exports = username;

username.prototype.isValid = function(value, cb){

  if(!value || value.trim() == ''){
    return cb(true);
  }

  const regex = /^[a-zA-Z\-]+$/;
  const resp = !!value.match(regex);

  return cb(resp);
}