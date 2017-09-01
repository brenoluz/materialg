var Base = require('./base');
var Q    = require('q');

var view = function(name){

  Base.call(this, name);

  this.container = CE('div', 'item item-icon-right');
  this.container.css({'white-space': 'normal'});
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.make = function(){

  this.container.html('');
  var defer = Q.defer();

  this.title = CE('span', 'wdl');
  this.title.text(this._title);
  this.container.append(this.title);

  //checkbox not have message
  this.message = CE('span', 'wdl', 'error');

  this.inputs = CE('span', 'item-checkbox');
  if(this._edit){
    this.makeInputs();
  }else{

  }
  this.container.append(this.inputs);

  defer.resolve();
  return defer.promise;
};

view.prototype.makeInputs = function(){

  var self = this;
  this.inputs.html('');

  var label = CE('label', 'checkbox');
  this.inputs.append(label);

  var value = !!this.value;

  if(this._edit){

    var input = CE('input').attr({'type': 'checkbox', name: this.name}).css({'float': 'right'});
    if(value) input.attr('checked', 'checked');
    input.click(function(){ self.value = $(this).is(':checked'); });
    label.append(input);
  }else{
   
    var span = CE('span', 'material-icons');
    if(value) span.html('&#xE5CA;');
    label.append(span);
  }
}
