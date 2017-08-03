var Base = require('../base');
var Q    = require('q');

var base = function(name){
  this.name      = !!name ? name : '';
  this.container = CE('label', 'item', 'item-input', 'item-stacked-label');
};
base.prototype = new Base;
base.prototype.constructor = base;
module.exports = base;

base.prototype.name      = null;
base.prototype.label     = null;
base.prototype.inputs    = null;
base.prototype.title     = null;
base.prototype.message   = null;
base.prototype.value     = null;

base.prototype._title    = '';

base.prototype.setTitle = function(title){
  this._title = title;
  if(this.title) this.title.text(title);
};

base.prototype.make = function(){

  this.container.html('');
  var defer = Q.defer();

  this.title = CE('span', 'wdl');
  this.title.text(this._title);
  this.container.append(this.title);

  this.message = CE('span', 'wdl', 'error');
  this.container.append(this.message);

  this.inputs = CE('div', 'box');
  this.makeInputs();
  this.container.append(this.inputs);

  defer.resolve();
  return defer.promise;
};

base.prototype.val = function(value){

  if(value === undefined){
    return this.value;
  }else{
    this.value = value;
    this.makeInputs();
  }
};

base.prototype.attr        = function(){ /*for overwrite*/ };
base.prototype.removeClass = function(){ /*for overwrite*/ };
base.prototype.makeInputs  = function(){ /*for overwrite*/ };
base.prototype.onchange    = function(){ /*for overwrite*/ };
