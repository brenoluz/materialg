var Base = require('./base');
var Q    = require('q');

var view = function(name){

  Base.call(this, name);

  this.container = CE('div', 'item item-icon-right');
  this.container.css({'white-space': 'normal'});

  this.value = false;
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.make = function(){

  this.container.html('');
  var defer = Q.defer();

  this.title = CE('span', 'wdl');
  this.title.html(this._title);
  this.container.append(this.title);

  //checkbox not have message
  this.message = CE('span', 'wdl', 'error');

  this.inputs = CE('span', 'item-checkbox');
  this.container.append(this.inputs);
  this.makeInputs();

  this._make = true;

  defer.resolve();
  return defer.promise;
};

view.prototype.makeInputs = function(){

  var self = this;
  this.inputs.html('');
  this.inputs.off('change');

  var label = CE('label', 'checkbox');
  this.inputs.append(label);

  var value = !!this.value;

  if(this._edit){
    var input = CE('input').attr({'type': 'checkbox', name: this.name}).css({'float': 'right'});
    if(value) input.attr('checked', 'checked');
    label.append(input);

    input.click(function(){
      self.value = $(this).is(':checked');
      self.onchange.call(self, self.value);
    });

  }else{
    this.container.css({'color' : '#6e6e6e'});
    var span = CE('span', 'material-icons wdr');
    if(value) span.html('&#xE5CA;');
    label.append(span);
  }
}

view.prototype.val = function(value){

  if(!!value){

    if(value == 9) value = false;
    if(value == "false") value = false;
    if(value == "true")  value = true;
  }

  return Base.prototype.val.call(this, value);
};
