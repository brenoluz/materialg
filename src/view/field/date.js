var Base = require('./base');

var view = function(name){
  this.name      = !!name ? name : '';
  this.container = CE('label', 'item', 'item-input', 'item-stacked-label');
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.make = function(){

  this.container.html('');
  var defer = Q.defer();

  this.title = CE('span', 'wdl');
  this.title.text(this._title);
  this.container.append(this.title);

  this.message = CE('span', 'wdl', 'error');
  this.container.append(this.message);

  this.inputs = CE('div', 'box', 'dateContainer');
  this.makeInputs();
  this.container.append(this.inputs);

  defer.resolve();
  return defer.promise;
};

view.prototype.makeInputs = function(){
  
  var div   = this.inputs.html('');
 
  var day   = CE('input', 'wdl').attr({'type': 'number', maxlength: "2", max: "31", min: "1",});
  var month = CE('input', 'wdl').attr({'type': 'number', maxlength: "2", max: "12", min: "1",});
  var year  = CE('input', 'wdl').attr({'type': 'number', maxlength: "4", max: "9999", min: "1",});

  div.append(day);
  div.append(CE('span', 'wdl').text('/'));
  div.append(month);
  div.append(CE('span', 'wdl').text('/'));
  div.append(year);

  day.keyup(function(e){
  
    var value = day.val();
    if(value.length > 1) month.focus();
  });

  month.keyup(function(e){
  
    var value = month.val();
    if(value.length > 1) return year.focus();
    if(value.length === 0) return day.focus().select();
  });

  year.keyup(function(e){
    
    var value = year.val();
    if(value.length > 4) return year.val(value.substr(0,4));
    if(value.length === 0) return month.focus().select();
  });

  div.focusout(function(e){

    var self = this;
  
    var v_day   = day.val();
    var v_month = month.val();
    var v_year  = year.val();

    if(v_day !== '' && v_month !== '' && year !== ''){
    
      var date = new Date(v_year, v_month - 1, v_day);
      var check = date.getFullYear() == v_year && date.getMonth() + 1 == v_month && date.getDate() == v_day;
      if(check){
        self.value = date;
        div.removeClass('wrong');
      }else{
        self.value = null;
        div.addClass('wrong');
      }
    }
  });

  div.find('input').on('change', function(e){
    var self = $(this);
    var value = self.val();
    var max = self.attr('maxlength');
    if(self.val() > max){
        self.val(value.substring(0, max));
    }
  });
};
