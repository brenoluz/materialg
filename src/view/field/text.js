var Base = require('./base');

var view = function(name){

  this.list      = [];
  this.name      = !!name ? name : '';
  this.container = CE('label', 'item', 'item-input', 'item-stacked-label');
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.makeInputs = function(){

  var self = this;
  this.inputs.html('');
  var input = CE('input').attr({'type': 'text', name: this.name});
  if(!!this.value) input.val(this.value);
  input.keyup(function(e){ self.value = input.val(); });
  this.inputs.append(input);
}
