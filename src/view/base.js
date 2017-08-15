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

base.prototype.render = function(){

  var self  = this;
  var defer = Q.defer();
  this.container.html('');

  var pre_promises = [];
  var pos_promises = [];

  var onmake = function(){

    for(var k in self.pos_make){
      var pos_function = self.pos_make[k];
      (function(func, ctx){ 

        var resp = func.call(ctx);
        if(typeof(resp) == 'object') pos_promises.push(resp);
      
      })(pos_function, self);
    }

    Q.all(pos_promises).then(function(){
      defer.resolve(self.container);
    }, console.log).done();
  }

  var onpre = function(){ self.make().then(onmake, console.log).done(); };

  for(var k in this.pre_make){
    var pre_function = this.pre_make[k];
    var resp = pre_function.call(self);
    if(typeof(resp) == 'object') pre_promises.push(resp);
  }
  Q.all(pre_promises).then(onpre, console.log).done();

  return defer.promise;
};

module.exports = base;
