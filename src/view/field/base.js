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
  this._errors    = {};
  this.filters    = [];

  this._title    = '';
  this._edit     = true;
  this._make     = false;

  this.forced       = null; //Force validation

  this._initChildren();
  this._children = [];
};
base.prototype = new Base;
base.prototype.constructor = base;
module.exports = base;

base.prototype._initChildren = function(){

  var self = this;

  this.child_container = CE('div', 'box');
  
  this.pos_make.push(function(){

    var def = Q.defer();

    self.child_container.html('');
    self.container.after(self.child_container);
  
    def.resolve();
    return def.promise;
  });
};

base.prototype.removeChildren = function(){

  var self  = this;
  var defer = Q.defer();

  this.child_container.fadeOut(function(){
    
    self._children = [];
    self.child_container.html('');
    self.child_container.show();
    defer.resolve();
  });

  return defer.promise;
};

base.prototype.append = function(field){

  if(field instanceof base){

    this._children.push(field);
    field.container.hide();
    this.child_container.append(field.container);
    field.container.fadeIn();

  }else{
    
    field.hide();
    this.child_container.append(field);
    field.fadeIn();
  }
};

base.prototype.edit = function(flag){
   
  this._edit = flag;
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

base.prototype.addError = function(msg){
  
  var key = this.name;

  if(!this._errors.hasOwnProperty(key)){
    this._errors[key] = [];
  }

  this._errors[key].push(msg);
};

base.prototype.getErrors = function(){

  return this._errors;
};

base.prototype.isValid = function(cb, obj) {

  var self = this;
  var res = true;
  this._errors = {};
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
    promises.push(def.promise);
    (function($validator, $def, $obj){
      $validator.isValid(value, function(res) {
        if(!res){
          self.message.text($validator.message);
          self.container.addClass('invalid');
          self.addError($validator);
        }
        $def.resolve(res);
      }, $obj);
    
    })(validator, def, obj);
  }

  //child validations
  for(var d in this._children){
    var child = this._children[d];
    var def = Q.defer();
    promises.push(def.promise);
    (function($child, $def, $obj){

      $child.isValid(function(res){
      
        if(!res){
          Object.assign(self._errors, $child.getErrors());
        }

        $def.resolve();

      }, $def.reject, $obj);

    })(child, def, obj);
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

base.prototype.getValues = function(){

  var values = {};

  var value  = this.val();
  values[this.name] = typeof value == 'string' ? value.trim() : value;

  for(var d in this._children){
    var child = this._children[d];
    values = Object.assign(values, child.getValues());
  }

  return values;
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
    this.title = CE('div', 'box');
    this.title.text(this._title);
    this.container.append(this.title);
  }

  this.message = CE('div', 'box', 'error');
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
