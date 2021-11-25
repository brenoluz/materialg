var Base = require('./base');

var view = function(name){

  Base.call(this, name);
  this.email = null;
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.makeInputs = function(){

  this.inputs.html('');

  this.email = CE('input').attr('type', 'email');

  if(!!this.value) this.email.val(this.value);
  if(!this._edit) this.email.attr('disabled', 'disabled');

  this.inputs.append(this.email);
}
