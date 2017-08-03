var Base = require('../base');
var Q    = require('q');

var CE = function(tag){

  var element = $(document.createElement(tag));
  for(var i = 1; i < arguments.length; i++){
      element.addClass(arguments[i]);
  }
  return element;
};
window.CE = CE;

var base = function(C){

  this.C = C; //Controller
  this.container = CE('div', 'box');
};
base.prototype = new Base;
base.prototype.constructor = base;
base.prototype.pre_make    = [];
base.prototype.pos_make    = [];

base.prototype.toString = function(){
  return this.render();
};

base.prototype.render = function(){

  var self  = this;
  var defer = Q.defer();
  this.container.html('');

  var pre_promises = [];
  var pos_promises = [];

  var onmake = function(){

    for(var k in self.pos_make){
      var pos_function = self.pos_make[k];
      var resp = pos_function.call(self);
      if(typeof(resp) == 'object') pos_promises.push(resp);
    }

    Q.all(pos_promises).then(function(){
      defer.resolve(self.container);
    });
  }

  var onpre = function(){ self.make().then(onmake); };

  for(var k in this.pre_make){
    var pre_function = this.pre_make[k];
    var resp = pre_function.call(self);
    if(typeof(resp) == 'object') pre_promises.push(resp);
  }
  Q.all(pre_promises).then(onpre);

  return defer.promise;
};

module.exports = base;
