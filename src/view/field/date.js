var Base = require('./base');
var Q    = require('q');

var view = function(name){

  Base.call(this, name);
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.make = function(){

  var defer = Q.defer();
  this.container.html('');

  this.title = CE('span', 'wdl');
  this.title.text(this._title);
  this.container.append(this.title);

  this.message = CE('span', 'wdl', 'error');
  this.container.append(this.message);

  this.inputs = CE('div', 'box', 'dateContainer');
  this.makeInputs();
  this.container.append(this.inputs);

  this._make = true;

  defer.resolve();
  return defer.promise;
};

view.prototype.makeInputs = function(){

  var self  = this;
  
  this.inputs.off('focusout');
  this.inputs.html('');
 
  var day   = CE('input', 'wdl').attr({'type': 'number', maxlength: "2", max: "31", min: "1", placeholder: 'dd'});
  var month = CE('input', 'wdl').attr({'type': 'number', maxlength: "2", max: "12", min: "1", placeholder: 'mm'});
  var year  = CE('input', 'wdl').attr({'type': 'number', maxlength: "4", max: "9999", min: "1", placeholder: 'aaaa'});

  if(!this._edit){
    day.attr('disabled', 'disabled');
    month.attr('disabled', 'disabled');
    year.attr('disabled', 'disabled');
  }

  this.inputs.append(day);
  this.inputs.append(CE('span', 'wdl').text('/'));
  this.inputs.append(month);
  this.inputs.append(CE('span', 'wdl').text('/'));
  this.inputs.append(year);

  day.keyup(function(e){
  
    var value = day.val();
    if(value.length > 1) month.focus();

  }).focusout(function(e){
  
    var value = day.val().trim();
    if(value == '0') return day.val('');
    if(value.length == 1){
      day.val('0' + value);
    }
  });

  month.keyup(function(e){
  
    var value = month.val().trim();
    if(value.length > 1) return year.focus();
    if(value.length === 0) return day.focus().select();

  }).focusout(function(e){
  
    var value = month.val().trim();
    if(value == '0') return month.val('');
    if(value.length == 1){
      month.val('0' + value);
    }
  });

  year.keyup(function(e){
    
    var value = year.val();
    if(value.length > 4) return year.val(value.substr(0,4));
    if(value.length === 0) return month.focus().select();
  });

  if(!!this.value){
    
    if(this.value instanceof Date){
      day.val(this.value.getDate());
      day.trigger('focusout');

      month.val(this.value.getMonth() + 1);
      month.trigger('focusout');

      year.val(this.value.getFullYear());
      year.trigger('focusout');
    }
  };

  this.inputs.on('keyup', function(e){

    var $this   = $(this);
    var v_day   = day.val().trim();
    var v_month = month.val().trim();
    var v_year  = year.val().trim();

    if(v_year.length != 4) v_year = '';
    console.log(v_day, v_month, v_year);

    if(v_day !== '' && v_month !== '' && year !== ''){

      var date = new Date(v_year, v_month - 1, v_day);
      var check = date.getFullYear() == v_year && date.getMonth() + 1 == v_month && date.getDate() == v_day;
      if(check){
        self.value = date;
        self.inputs.removeClass('wrong');
        return;
      }
    }

    self.value = '';
    self.inputs.addClass('wrong');
  });

  self.inputs.find('input').on('change', function(e){

    var that  = $(this);
    
    var value = that.val().trim();
    var max   = that.attr('maxlength');
    if(value.length > max){
        that.val(value.substring(0, max));
    }
  });
};
