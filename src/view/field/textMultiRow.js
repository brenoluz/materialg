var Base = require('./base');

var view = function(name){

  this.list      = [];
  this.name      = !!name ? name : '';
  this.title     = '';
  this.value     = '';
  this.container = null;
  this.sequence  = 0;
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.setTitle = function(title){
  this.title = title;
};

view.prototype.make = function(){

  var self = this;

  var div = CE('div', 'form-group');
  var label = CE('label').text(this.title);
  div.append(label);

  this.input = CE('input', 'form-control').attr({type: 'text'});
  this.input.focusout(function(){ self.add.call(self); });
  div.append(this.input);

  this.list = CE('div', 'box');
  div.append(this.list);

  this.output = CE('input').attr({type: 'hidden', name: this.name});
  div.append(this.output);

  return div;
};

view.prototype.add = function(){

  var found = false;

  var text  = this.input.val().trim();
  if(text == '') return;

  var rowid = parseInt(this.input.attr('rowid'));

  if(isNaN(rowid)) rowid = --this.sequence;

  var values = this.getValues();
  for(var v in values){
    var value = values[v];
    if(value.id == rowid){
      found = true;
      values[v].value = text;
      break;
    }
  }

  if(!found){
    values.push({id: rowid, value: text});
  }

  this.setValues(values);
  this.refresh(values);
  this.clear_input();
  this.input.focus();
};

view.prototype.clear_input = function(){
  this.input.val('');
  this.input.attr('rowid', '');
};

view.prototype.refresh = function(values){

  var self = this;

  this.list.html('');
  var div = CE('div', 'box').css({'border': '1px solid #ccc', 'margin-top': '5px'});
  this.list.append(div);

  var values = !!values ? values : this.getValues();

  if(values.length == 0){
    div.remove();
    return;
  }

  for(var v in values){
    var value = values[v];
    var row   = CE('div', 'box').css({'border-bottom': '1px solid #ccc', 'padding': '5px'}).attr('rowid', value.id);
    div.append(row);
    var text  = CE('span', 'left').text(value.value);
    row.append(text);

    (function(value){

      var del  = CE('button', 'btn', 'btn-danger', 'btn-xs', 'right').attr({type: 'button'}).text('Apagar');
      del.click(function(){ self.delete.call(self, value.id) });
      row.append(del);

      var edit = CE('button', 'btn', 'btn-warning', 'btn-xs', 'right').attr({type: 'button'}).text('Editar');
      edit.click(function(){ self.edit.call(self, value.id) });
      row.append(edit);

    })(value);
  };
};

view.prototype.edit = function(id){

  var values = this.getValues();
  var self   = this;

  for(var v in values){
    var value = values[v];
    if(value.id == id){
      self.input.val(value.value);
      self.input.attr('rowid', value.id);
      break;
    }
  }
};

view.prototype.delete = function(id){

  var values = this.getValues();
  var self   = this;

  for(var v in values){
    var value = values[v];
    if(value.id == id){

      values.splice(v, 1);
      break;
    }
  }

  this.setValues(values);
  this.refresh();
};

view.prototype.getValues = function(){

  var json_data = this.output.val();
  if(json_data == '') json_data = '[]';
  return JSON.parse(json_data);
};

view.prototype.setValues = function(values){

  var json_data = JSON.stringify(values);
  this.output.val(json_data);
};
