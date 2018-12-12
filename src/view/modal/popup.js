var Base = require('./base');
var back = require('../../back');
var Q    = require('q');

var popup = function(){

  Base.call(this);

  this.MODAL_PRIORITY = back.DIALOG;
  this.container = CE('div', 'popup-container popup-showing active');
  this.container.css({'background-color': 'rgba(0, 0, 0, 0.4)'});

  this._title  = '';
  this._body   = '';
  this.buttons = [];
};
popup.prototype = new Base;
popup.prototype.constructor = popup;
module.exports = popup;

popup.prototype.setTitle = function(title){

  this._title = title;
};

popup.prototype.setBody = function(body){

  this._body = body;
};

popup.prototype.addButton = function(button){

  button.click(this.remove.bind(this));
  this.buttons.push(button);
};

popup.prototype.make = function(){

  var self = this;
  var def  = Q.defer();

  back.add(this.MODAL_PRIORITY, function(){ self.back.call(self); });

  var popup = CE('div', 'popup').css({'background-color': '#fff'});
  this.container.append(popup);

  if(!!this._title){
    var head = CE('div', 'popup-head');
    popup.append(head);
    head.append(CE('h3', 'popup-title').text(this._title));
  }

  var body = CE('div', 'popup-body');
  body.append(this._body);
  popup.append(body);

  if(!!this.buttons.length){
  
    var buttons = CE('div', 'popup-buttons');
    popup.append(buttons);
    for(var b in this.buttons) buttons.append(this.buttons[b]);
  }

  def.resolve();
  return def.promise;
};

