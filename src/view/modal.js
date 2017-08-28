var Base = require('./modal/base');
var Q    = require('q');

var modal = function(){

  Base.call(this);

  this._title = '';
  this._left_button  = null;
  this._right_button = null;
};
modal.prototype = new Base;
modal.prototype.constructor = modal;
module.exports = modal;


modal.prototype.setBody = function(body){

  this._body = body;
};

modal.prototype.setLeftButton = function(button){
  
  this._left_button = button;
};

modal.prototype.setRightButton = function(button){

  this._right_button = button;
};

modal.prototype.setTitle = function(title){

  this._title = title;
};

modal.prototype.make = function(){
  
  var self = this;
  var def  = Q.defer();

  Base.prototype.make.call(this).then(function(){
  
    var hasHeader = !!self._title || !!self._left_button || !!self._right_button;
    console.log(hasHeader);
    if(hasHeader){
      var header = CE('div', 'bar bar-header');
      self.modal.append(header);

      if(!!self._left_button) header.append(self._left_button);
      if(!!self._title){
        var title = CE('h1', 'title title-left');
        header.append(title);
        title.text(self._title);
        if(!!self._left_button)  title.css('left', '92px');
        if(!!self._right_button) title.css('right', '92px');
      }
      if(!!self._right_button) header.append(self._right_button);
    }

    var content = CE('div', 'scroll-content ionic-scroll overflow-scroll');
    if(hasHeader) content.addClass('has-header');
    self.modal.append(content);
    content.append(self.body);

    def.resolve();
  });

  return def.promise;
};

