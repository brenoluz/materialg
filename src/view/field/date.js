var Base = require('./base');

var view = function(name){

  this.list      = [];
  this.name      = !!name ? name : '';
  this.title     = '';
  this.value     = '';
  this.container = null;
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.setTitle = function(title){
  this.title = title;
};

view.prototype.make = function(){

  var div = CE('div', 'box');

  var label = CE('label', 'item', 'item-input', 'item-stacked-label');
  div.append(label);

  var title = CE('span', 'wdl').text(this.title);
  label.append(title);

  this.message = CE('span', 'wdl', 'error');
  label.append(this.message);

  this.container = CE('div', 'box');
  this.makeInputs();
  div.append(this.container);

  return div;
};

view.prototype.makeInputs = function(){

  
};
