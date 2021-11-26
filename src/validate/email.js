const Base = require('./base');

const email = function(){
  this.message = 'Email inválido';  

  Base.constructor.call(this);
}

email.prototype = new Base;
email.prototype.constructor = email;
module.exports = email;

email.prototype.isValid = function(value, cb){

  if(!value || value.trim() == ''){
    return cb(true);
  }

  let text = String(value).toLowerCase();
  let resp = !!text.match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

  cb(resp);
};