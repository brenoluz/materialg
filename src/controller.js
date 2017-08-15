var Base = require('./base');
var Q    = require('q');

var controller = function(params){

  Base.call(this);

  this.params = params;
  this.view   = null;
};
controller.prototype = new Base;
controller.prototype.constructor = controller;

controller.prototype.make = function(){
  return this.view.render();
};

module.exports = controller;
