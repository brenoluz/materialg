const Base  = require('./base');
const tools = require('../../tools');
var Q    = require('q');

var view = function(name){

  Base.call(this, name);
  this.format = null;
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.make = function(){

  var defer = Q.defer();
  this.container.html('');

  this.title = CE('div', 'box');
  this.title.text(this._title);
  this.container.append(this.title);

  this.message = CE('div', 'box', 'error');
  this.container.append(this.message);

  this.inputs = CE('div', 'box', 'dateContainer');
  this.makeInputs();
  this.container.append(this.inputs);

  this._make = true;

  defer.resolve();
  return defer.promise;
};

view.prototype.set_format = function(format){

  this.format = format;
}

view.prototype.get_format = function(){

  if(!this.format){
    this.format = (new Date('2000/11/30')).toLocaleDateString().replace('2000','aaaa').replace('11', 'MM').replace('30','dd');
  }

  return this.format;
}

view.prototype.makeInputs = function(){

  this.inputs.html('');

  let format = this.get_format();
  let input  = CE('input', 'wdl').attr({'type': 'tel', maxlength: "10", placeholder: format});
  input.keyup(this.keyup.bind(this, input));

  this.inputs.append(input);

  if(!this._edit){
    input.attr('disabled', 'disabled');
  }
}

view.prototype.keyup = function(input, event){

  let value  = input.val().trim();
  this.value = value;
  
  if([229, 8, 13].indexOf(event.keyCode) >= 0){
    return;
  }

  let format     = this.get_format()
  let size       = value.length;   
  let next_digit = format.substr(size, 1);

  if(next_digit == '/' || next_digit == '-'){
    this.value = value + next_digit; 
    input.val(this.value);
  }
}

view.prototype.getValue = function(){

  let format = this.get_format()
  let value  = this.value.trim();
  let date   = tools.transform_date(value, format, 'aaaa/MM/dd');

  if(!date){
    return '';
  }

  return new Date(date);
}

