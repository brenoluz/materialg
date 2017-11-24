var Base = require('../base');
var Q    = require('q');

var base = function(name){

  Base.call(this);

  this.name      = !!name ? name : '';
  this.container = CE('label', 'item', 'item-input', 'item-stacked-label');

	this.label     = null;
	this.inputs    = null;
	this.title     = null;
	this.message   = null;
	this.value     = '';

  this.pre_make  = [];
  this.pos_make  = [];

  this.validators = [];
  this.filters    = [];

  this._title    = '';
  this._edit     = true;
  this._make     = false;

  this.forced    = null;
};
base.prototype = new Base;
base.prototype.constructor = base;
module.exports = base;

base.prototype.edit = function(flag){
   
  this._edit = flag;
  //return this.render();
};

base.prototype.addValidator = function(validator){
  this.validators.push(validator);
};

base.prototype.addFilter = function(filter){
  this.filter.push(filter);
};

base.prototype.setTitle = function(title){
  this._title = title;
  if(this.title) this.title.text(title);
};

base.prototype.getValue = function(){

  var value = this.value;
  for(var f in this.filters){
    var filter = this.filters[f];
    var value  = filter.filter(value);
  }

  return value;
};

base.prototype.onisvalid = function(res){};

base.prototype.forceValid = function(res, message){

  if(res == null){
    this.forced = null;
    return;
  }

  this.forced = [res, message];
};

base.prototype.isValid = function(cb, obj) {

  var self = this;
  var res = true;
  var promises = [];
  var value = this.getValue();

  self.message.text('');
  this.container.removeClass('invalid');

  if(!!this.forced){
    this.message.text(this.forced[1]);
    this.container.addClass('invalid');
    return cb(this.forced[0]);
  }

  for(var v in this.validators){
    var validator = this.validators[v];
    var def = Q.defer();
    (function($validator, $def, $obj){
      $validator.isValid(value, function(res) {
        if(!res){
          self.message.text($validator.msg);
          self.container.addClass('invalid');
        }
        $def.resolve(res);
      }, $obj);
    
    })(validator, def);
    promises.push(def.promise);
  }

  Q.all(promises).then(function(data){
   
    var args = Array.prototype.slice.call(data);
    if (args.indexOf(false) >= 0) {
      self.onisvalid(false);
      cb(false);
    }else{
      self.onisvalid(true);
      cb(true);
    }
  });
};

base.prototype.makeShow = function(){

  var self = this;
  this.inputs.html('');

  var value = !!this.value ? this.value : '---';

  if(value instanceof Date){
    value = value.getDisplay();
  }

  var span = CE('span', 'input_area');
  span.css({'paddin-top': '6px'});
  span.text(value);

  this.inputs.append(span);
};

base.prototype.make = function(){
  
  this.container.html('');
  var defer = Q.defer();

  if(!!this._title){
    this.title = CE('span', 'wdl');
    this.title.text(this._title);
    this.container.append(this.title);
  }

  this.message = CE('span', 'wdl', 'error');
  this.container.append(this.message);

  this.inputs = CE('div', 'box');
  this.makeInputs();
  this.container.append(this.inputs);

  this._make = true;

  defer.resolve();
  return defer.promise;
};

base.prototype.val = function(value){

  if(value === undefined){
    return this.value;
  }else{
    this.value = value;
    if(this._make) this.makeInputs();
  }
};

base.prototype.clear = function(){

  self.val('');
};

base.prototype.attr        = function(){ /*for overwrite*/ };
base.prototype.removeClass = function(){ /*for overwrite*/ };
base.prototype.makeInputs  = function(){ /*for overwrite*/ };
base.prototype.onchange    = function(){ /*for overwrite*/ };
