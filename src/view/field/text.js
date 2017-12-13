var Base = require('./base');

var view = function(name){

  Base.call(this, name);

  this.maxlength = null;
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.setMaxlenght = function(size){

  this.maxlength = size;
};

view.prototype.makeInputs = function(){

  var self = this;
  this.inputs.html('');
  var input = CE('input').attr({'type': 'text', name: this.name});

  if(!!this.maxlength){
    input.attr('maxlength', this.maxlength);
  }else{
    input.removeAttr('maxlength');
  }

  if(!!this.value) input.val(this.value);
  if(!this._edit)  input.attr('disabled', 'disabled');
  input.keyup(function(e){ self.value = input.val(); self.keyup.call(self, e); });
  this.inputs.append(input);
};

view.prototype.keyup = function(){};
