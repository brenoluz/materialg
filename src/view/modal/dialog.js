var Popup = require('./popup');
var back  = require('../../back');
var Q     = require('q');

var dialog = function(){

  Popup.call(this);

  this.MODAL_PRIORITY = back.DIALOG;
  this.container = CE('div', 'popup-container popup-showing active');
  this.container.css({'background-color': 'rgba(0, 0, 0, 0.4)'});

  this._title  = '';
  this._body   = '';
  this.buttons = [];
};
dialog.prototype = new Popup;
dialog.prototype.constructor = dialog;
module.exports = dialog;

dialog.prototype.make = function(){

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
  popup.append(body);

  var div = CE('div');
  body.append(div);

  if(typeof this._body == 'object'){
    div.append(this._body);
  }else{
    div.text(this._body);
  }

  if(!!this.buttons.length){
  
    var buttons = CE('div', 'popup-buttons');
    popup.append(buttons);
    for(var b in this.buttons) buttons.append(this.buttons[b]);
  }

  def.resolve();
  return def.promise;
};

