var Base = require('./base');

var view = function(name){

  this.list      = [];
  this.name      = !!name ? name : '';
  this.title     = '';
  this.value     = '';
  this.container = null;
  this.title_cont  = CE('span', 'wdl');
  this.title_label = CE('label', 'item', 'item-select');
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.setTitle = function(title){
  this.title = title;
};

view.prototype.makeInputs = function(){

  var self = this;
  var inputs = this.inputs.html('');

  var option = CE('option').css({'display': 'none'}).val('');
  inputs.append(option);

  for(var x in this.list){

    var key   = this.list[x][0];
    var label = this.list[x][1];

    var option = CE('option').val(key).text(label);
    option.css({float: 'right', width: '30px', height: '2em', border: '0px'});
    this.container.append(option);

    if(this.value == key) option.attr('selected', 'selected');
  }

  this.container.change(function(){ self.value = self.container.find(':selected').val(); self.onchange.call(self, self.value); });
};

view.prototype.add = function(key, label){
  this.list.push([key, label]);
};
