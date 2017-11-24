var Base = require('./base');
var Q    = require('q');

var view = function(name){

  Base.call(this, name);
  this.list = [];

  this.container = CE('div', 'box');
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.makeInputs = function(){

  var self = this;
  this.inputs.html('');

  for(var x in this.list){

    var key   = this.list[x][0];
    var label = this.list[x][1];

    var input = CE('input').attr({type: 'radio', name: this.name, value: key});
    if(!this._edit) input.attr('disabled', 'disabled');
    input.css({float: 'right', width: '30px', height: '2em', border: '0px'});
    this.inputs.append(CE('label', 'item').text(label).append(input));

    if(this.value == key) input.attr('checked', 'checked');
  }

  this.inputs.change(function(e){ self.value = self.container.find(':checked').val(); self.onchange.call(self, e); });
};

view.prototype.add = function(key, label){
  this.list.push([key, label]);
};
