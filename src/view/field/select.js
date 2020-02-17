var Base = require('./base');
var Q    = require('q');

var view = function(name){

  Base.call(this, name);
  this.list      = [];
  this.container = CE('label', 'item', 'item-select');
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.make = function(){

  this.container.html('');
  var defer = Q.defer();

  this.title = CE('span', 'box');
  this.title.html(this._title);
  this.container.append(this.title);

  this.message = CE('span', 'box', 'error');
  this.container.append(this.message);

  this.inputs = CE('select');
  if(!this._edit)  this.inputs.attr('disabled', 'disabled');
  this.makeInputs();
  this.container.append(this.inputs);

  this._make = true;

  defer.resolve();
  return defer.promise;
};

view.prototype.makeInputs = function(){

  var self = this;

  this.inputs.html('');
  this.inputs.off('change');
  
  var option = CE('option').css({'display': 'none'}).val('');
  this.inputs.append(option);

  for(var x in this.list){

    var key   = this.list[x][0];
    var label = this.list[x][1];

    var option = CE('option').val(key).text(label);
    option.css({float: 'right', width: '30px', height: '2em', border: '0px'});
    this.inputs.append(option);

    if(this.value == key) option.attr('selected', 'selected');
  }

  this.inputs.on('change', function(){
    self.value = self.container.find(':selected').val();
    self.onchange.call(self, self.value);
  });

};

view.prototype.add = function(key, label){
  this.list.push([key, label]);
};
