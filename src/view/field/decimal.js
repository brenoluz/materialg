var Base = require('./base');

var view = function(name, decimal){

  Base.call(this, name);

  this.decimal = !!decimal ? decimal : 2;
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.step = function(){

  var step = '.';
  for(var i = 1; i < this.decimal; i++){
    step += '0';
  }
  step += '1';
  return step;
};

view.prototype.getValue = function(){

  var value = Base.prototype.getValue.call(this);
  if(typeof value == "string"){
    value = value.replace(',', '.');
  }

  return !!value ? parseFloat(value) : null;
};

view.prototype.makeInputs = function(){

  var self = this;
  this.inputs.html('');

  var input = CE('input').attr({
    'type': 'number', 
    'step': this.step(), 
    'min': 0, 
    'max': 10, 
    name: this.name,
    inputmode: 'decimal',
    autocomplete: 'off'
  });
  this.inputs.append(input);

  if(!!this.value) input.val(this.value.formatMoney(self.decimal, '.', ''));
  if(!this._edit)  input.attr('disabled', 'disabled');

  input.keyup(function(e){
      var $this  = $(this);
      var value = $this.val();
      var value  = value.replace('.','');
      var value  = parseInt(value);
      self.value = (value/Math.pow(10, self.decimal)).formatMoney(self.decimal, '.', '');
      $this.val(self.value);
      self.fireEvent('keyup', [this, this.value]);

  }).focusout(function(e){
      var $this = $(this);
      var value = $this.val().replace('.','');
      var value = parseInt(value);
      if(value == 0){
        self.value = null; 
        $this.val('');
      }
      self.fireEvent('keyup', [this, this.value]);
  }).change(function(e){

    self.onchange.call(self, self.value);

  });
}


