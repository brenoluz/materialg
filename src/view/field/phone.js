var Base = require('./base');

var view = function(name){

  Base.call(this, name);
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.makeInputs = function(){

  var self = this;
  this.inputs.html('');

  this.phone = CE('input').attr('type', 'tel');
  this.phone.keyup(function(e){ 

    var $this = $(this);
    var val   = $this.val();

    //Se foi apagado algum underline
    var to_clean = (!!this.last_value && this.last_value.search('________') > 0 && val.search('________') < 0);

    if(to_clean){
      val = '';
    }

    var value = self.format.call(self, val); 

    this.last_value = value;
    $this.val(value);
    this.onchange.call(self, self.value);
  });


  if(!!this.value) this.phone.val(this.format(this.value));
  if(!this._edit)  this.phone.attr('disabled', 'disabled');

  this.inputs.append(this.phone);

};

view.prototype.format = function(value){

  this.value = this.filter(value).slice(0, 11);
  var len    = this.value.length;
  var resp   = '(';

  resp += this.value.slice(0, 2);
  
  if(len < 2) return resp;

  resp += ') ';

  var rest = 11 - len;
  for(var i = 0; i < rest; i++){
    if(i == 0){
      resp += ' ';
    }else{
      resp += '_';
    }
  }

  if(len > 6){
  
    resp += this.value.slice(2, (len-6)+2);
    resp += '-';
    resp += this.value.slice((len-6)+2, 11);
  }else{
  
    resp += this.value.slice(2, 6);
  }

  return resp;
};

view.prototype.filter = function(value){

  var regex = /\d+/g;
  var match = value.match(regex);

  if(!!match) return match.join('');
  return '';
};

