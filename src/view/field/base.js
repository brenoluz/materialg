var View = require('../view');

var base = function(){

  this.list      = [];
  this.name      = !!name ? name : '';
  this.label     = '';
  this.value     = null;
  this.container = null;
};
base.prototype = new View;
base.prototype.constructor = base;
module.exports = base;

base.prototype.setLabel = function(label){
  this.label = label;
};

base.prototype.val = function(value){

  if(value === undefined){
    return this.value;
  }else{
    this.value = value;
    this.makeInputs();
  }
};

base.prototype.makeInputs = function(){ /*For extend*/ };
