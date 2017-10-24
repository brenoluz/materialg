var Base = require('./base');

var view = function(name){

  Base.call(this, name);
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.makeInputs = function(){

  var self = this;
  this.inputs.html('');
  var input = CE('input').attr({'type': 'text', name: this.name});
  if(!!this.value) input.val(this.value);
  if(!this._edit)  input.attr('disabled', 'disabled');
  input.keyup(function(e){ self.value = input.val(); });
  this.inputs.append(input);
}
