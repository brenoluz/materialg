var Base = require('./base');
var Q    = require('q');

var controller = function(params){

  Base.call(this);

  this.params   = params;
  this.view     = null;
  this.stages   = {};

  this._attached = null;
  this._parent   = null;
};
controller.prototype = new Base;
controller.prototype.constructor = controller;

controller.prototype.make = function(){
  return this.view.render();
};

controller.prototype.attach = function(ctrl){

  this._attached = ctrl;
  ctrl._parent   = this;
  this.view.attach(this._attached.view);
};

controller.prototype.dispatch = function(stage){

  var current = stage.shift();

  if(!current){
    return Q(true);
  }

  if(this.stages.hasOwnProperty(current)){

    var ctrl = this.stages[current];
    
    if(this._attached instanceof ctrl){
    
      return this._attached.dispatch(stage);
    }else{
    
      var instance = new ctrl();
      this.attach(instance);
      return instance.make().then(() => {
      
        return instance.dispatch(stage);
      });
    }
  }
};

controller.prototype.destroy = function(){ /* For extend */  };

module.exports = controller;
