var Base = require('./base');
var Q    = require('q');
var View = require('./view/base');

var controller = function(params){
  this.params = params;
  this.view   = new View;
};
controller.prototype = new Base;
controller.prototype.constructor = controller;

controller.prototype.make = function(){
  return this.view.render();
};

module.exports = controller;
