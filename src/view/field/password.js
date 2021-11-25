const Base = require('./base');

const view = function(name){

  Base.call(this, name);
  this.password = null;
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.getValue = function(){

  var value = this.password.val();
  for(var f in this.filters){
    var filter = this.filters[f];
    var value  = filter.filter(value);
  }

  return value;
};

view.prototype.makeInputs = function(){

  this.inputs.html('');

  const eye = CE('i', 'wdr icon placeholder-icon material-icons');
  eye.text('visibility_off');
  this.inputs.append(eye);
  
  this.password = CE('input', 'wdl').attr('type', 'password');
  this.password.css({
    width: "calc(100% - 36px)",
  });
  this.inputs.append(this.password);
  
  eye.unbind('click');
  eye.get(0).onclick = event => {
    let input = this.password.get(0);
    if(input.type == 'password'){
      input.type = 'text';
      eye.text('visibility');
    }else{
      input.type = 'password';
      eye.text('visibility_off');
    }
  };

  this.password.change(event => {
    this.value = this.password.val().trim();
    this.onchange.call(this, this.value);
  });

  if(!!this.value) this.password.val(this.value);
  if(!this._edit) this.password.attr('disabled', 'disabled');

  return Promise.resolve();
}

