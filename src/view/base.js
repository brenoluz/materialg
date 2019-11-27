var Base = require('../base');

var CE = function(tag){

  var element = $(document.createElement(tag));
  for(var i = 1; i < arguments.length; i++){
      element.addClass(arguments[i]);
  }
  return element;
};
window.CE = CE;

var base = function(C){
  
  Base.call(this);

  this.C = C; //Controller
  this.container = CE('div', 'box');

  this.pre_make = [];
  this.pos_make = [];
};
base.prototype = new Base;
base.prototype.constructor = base;

base.prototype.toString = function(){
  return this.container.html();
};

base.prototype.render = async function(arg){

  this.container.html('');

  let pre_promises = [];
  for(let func of this.pre_make){

    let resp = func.call(this, arg);
    if(typeof(resp) == 'object') pre_promises.push(resp);
  }
  await Promise.all(pre_promises)

  await this.make(arg);

  let pos_promises = [];
  for(let func of this.pos_make){

    let resp = func.call(this, arg);
    if(typeof(resp) == 'object') pos_promises.push(resp);
  }
  
  return Promise.all(pos_promises);
};

module.exports = base;
