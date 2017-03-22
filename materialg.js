(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.materialg = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  'view':     require('./view/index'),
  'validate': require('./validate/index'),
};

},{"./validate/index":5,"./view/index":12}],2:[function(require,module,exports){
var Checked = function(elements){

    this.elements = elements;
    this.msg = 'Selecione um dos campos';
};
module.exports = Checked;

Checked.prototype.isValid = function(value, cb){

    var res = false;
    if(this.elements.filter(':checked').size() == 1) res = true;

    cb(res);
};

},{}],3:[function(require,module,exports){
var Container = function(){

    this.elements = [];
};
module.exports = Container;

Container.prototype.append = function(element){

    this.elements.push(element);
};

Container.prototype.isValid = function(cb, obj){

  var promises = [];
  for(var e in this.elements){
      var element = this.elements[e];
      var def = new $.Deferred(function(def){
          element.isValid(function(res){ def.resolve(res); }, obj);
      });
      promises.push(def);
  }

  $.when.apply(undefined, promises).promise().done(function(){

      var args = Array.prototype.slice.call(arguments);
      cb(args.indexOf(false) < 0);
  });
};

Container.prototype.getValues = function(){

  var values = {};
  for(var e in this.elements){
    var element = this.elements[e];
    var name    = !!element.name ? element.name : element.attr('name');
    if(!!name)  values[name] = element.getValue();
  }

  return values;
};

},{}],4:[function(require,module,exports){
var Decorator = function(element, msg) {

    if(element.validators) return element;

    element.validators = [];
    element.filters    = [];

    if(!element.name) element.name = element.attr('name');

    element.addValidator = function(validator){
        this.validators.push(validator);
    };

    element.addFilter = function(filter){
        this.filter.push(filter);
    };

    element.getValue = function(){

        var value = this.val().trim();
        for(var f in this.filters){

          var filter = this.filters[f];
          var value  = filter.filter(value);
        }

        return value;
    };

    element.isValid = function(cb, obj) {

        var self = this;
        var res = true;
        var promises = [];
        var value = this.getValue();
        if (msg) msg.text('');
        element.removeClass('invalid');

        for(var v in this.validators){
            var validator = this.validators[v];
            var def = new $.Deferred(function(def) {
                validator.isValid(value, function(res) {
                    if (!res && msg) {
                        msg.text(validator.msg);
                        element.addClass('invalid');
                    }
                    def.resolve(res);
                }, obj);
            });
            promises.push(def);
        }


        $.when.apply(undefined, promises).promise().done(function() {

            var args = Array.prototype.slice.call(arguments);
            if (args.indexOf(false) >= 0) {
                cb(false);
            } else {
                cb(true);
            }
        });
    };

    return element;
};

module.exports = Decorator;

},{}],5:[function(require,module,exports){
module.exports = {
  'Container':         require('./container'),
  'Decorator':         require('./decorator'),
  'Checked':           require('./checked'),
  'NotEmpty':          require('./notEmpty'),
  'NotEmptyDependent': require('./notEmptyDependent'),
};

},{"./checked":2,"./container":3,"./decorator":4,"./notEmpty":6,"./notEmptyDependent":7}],6:[function(require,module,exports){
var NotEmpty = function(){

    this.msg = 'Campo obrigatório';
};
module.exports = NotEmpty;

NotEmpty.prototype.isValid = function(value, cb){

    var value = value.trim();
    if(value === null || value == undefined || value == ''){
        return cb(false);
    }

    return cb(true);
};

},{}],7:[function(require,module,exports){
var NotEmptyDependent = function(dep){

    this.dependent = dep;
    this.msg = 'Campo obrigatório';
};
module.exports = NotEmptyDependent;

NotEmptyDependent.prototype.isValid = function(value, cb){
    if(value == ''){
        var dep = this.dependent.val();
        if(dep != '') return cb(false);
    }

    return cb(true);
};

},{}],8:[function(require,module,exports){
var View = require('../view');

var base = function(){

  this.list      = [];
  this.name      = !!name ? name : '';
  this.label     = '';
  this.value     = null;
  this.container = null;
};
base.prototype = new View;
base.prototype.constructor = base;
module.exports = base;

base.prototype.setLabel = function(label){
  this.label = label;
};

base.prototype.val = function(value){

  if(value === undefined){
    return this.value;
  }else{
    this.value = value;
    this.makeInputs();
  }
};

base.prototype.attr        = function(){ /*for overwrite*/ };
base.prototype.removeClass = function(){ /*for overwrite*/ };
base.prototype.makeInputs  = function(){ /*for overwrite*/ };

},{"../view":13}],9:[function(require,module,exports){
module.exports = {
  'Base':          require('./base'),
  'Radio':         require('./radio'),
  'TextMultiRow':  require('./textMultiRow'),
};

},{"./base":8,"./radio":10,"./textMultiRow":11}],10:[function(require,module,exports){
var Base = require('./base');

var view = function(name){

  this.list      = [];
  this.name      = !!name ? name : '';
  this.title     = '';
  this.value     = '';
  this.container = null;
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.setTitle = function(title){
  this.title = title;
};

view.prototype.make = function(){

  var div = CE('div', 'box');

  var label = CE('label', 'item', 'item-input', 'item-stacked-label');
  div.append(label);

  var title = CE('span', 'wdl').text(this.title);
  label.append(title);

  this.message = CE('span', 'wdl', 'error');
  label.append(this.message);

  this.container = CE('div', 'box');
  this.makeInputs();
  div.append(this.container);

  return div;
};

view.prototype.makeInputs = function(){

  var self = this;
  this.container.html('');

  for(var x in this.list){

    var key   = this.list[x][0];
    var label = this.list[x][1];

    var input = CE('input').attr({type: 'radio', name: this.name, value: key});
    input.css({float: 'right', width: '30px', height: '2em', border: '0px'});
    this.container.append(CE('label', 'item').text(label).append(input));

    if(this.value == key) input.attr('checked', 'checked');
  }

  this.container.change(function(){ self.value = self.container.find(':checked').val(); });
};

view.prototype.add = function(key, label){
  this.list.push([key, label]);
};

},{"./base":8}],11:[function(require,module,exports){
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

},{"./base":8}],12:[function(require,module,exports){
module.exports = {
  'View':   require('./view'),
  'field':  require('./field/index'),
};

},{"./field/index":9,"./view":13}],13:[function(require,module,exports){
var CE = function(tag){

    var element = $(document.createElement(tag));
    for(var i = 1; i < arguments.length; i++){
        element.addClass(arguments[i]);
    }
    return element;
};
window.CE = CE;

var base = function(C){

    this.pos_make = [];
    this.pre_make = [];
    this.C = C; //Controller
}

base.prototype.toString = function(){
    return this.render();
};

base.prototype.make     = function(){};

base.prototype.render = function(){

    var self = this;

    $.each(this.pre_make, function(k, v){ v.call(self); });
    var render = this.make();
    $.each(this.pos_make, function(k, v){ v.call(self); });
    return render;
};

module.exports = base;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9pbmRleC5qcyIsInNyYy92YWxpZGF0ZS9jaGVja2VkLmpzIiwic3JjL3ZhbGlkYXRlL2NvbnRhaW5lci5qcyIsInNyYy92YWxpZGF0ZS9kZWNvcmF0b3IuanMiLCJzcmMvdmFsaWRhdGUvaW5kZXguanMiLCJzcmMvdmFsaWRhdGUvbm90RW1wdHkuanMiLCJzcmMvdmFsaWRhdGUvbm90RW1wdHlEZXBlbmRlbnQuanMiLCJzcmMvdmlldy9maWVsZC9iYXNlLmpzIiwic3JjL3ZpZXcvZmllbGQvaW5kZXguanMiLCJzcmMvdmlldy9maWVsZC9yYWRpby5qcyIsInNyYy92aWV3L2ZpZWxkL3RleHRNdWx0aVJvdy5qcyIsInNyYy92aWV3L2luZGV4LmpzIiwic3JjL3ZpZXcvdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAndmlldyc6ICAgICByZXF1aXJlKCcuL3ZpZXcvaW5kZXgnKSxcbiAgJ3ZhbGlkYXRlJzogcmVxdWlyZSgnLi92YWxpZGF0ZS9pbmRleCcpLFxufTtcbiIsInZhciBDaGVja2VkID0gZnVuY3Rpb24oZWxlbWVudHMpe1xuXG4gICAgdGhpcy5lbGVtZW50cyA9IGVsZW1lbnRzO1xuICAgIHRoaXMubXNnID0gJ1NlbGVjaW9uZSB1bSBkb3MgY2FtcG9zJztcbn07XG5tb2R1bGUuZXhwb3J0cyA9IENoZWNrZWQ7XG5cbkNoZWNrZWQucHJvdG90eXBlLmlzVmFsaWQgPSBmdW5jdGlvbih2YWx1ZSwgY2Ipe1xuXG4gICAgdmFyIHJlcyA9IGZhbHNlO1xuICAgIGlmKHRoaXMuZWxlbWVudHMuZmlsdGVyKCc6Y2hlY2tlZCcpLnNpemUoKSA9PSAxKSByZXMgPSB0cnVlO1xuXG4gICAgY2IocmVzKTtcbn07XG4iLCJ2YXIgQ29udGFpbmVyID0gZnVuY3Rpb24oKXtcblxuICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IENvbnRhaW5lcjtcblxuQ29udGFpbmVyLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihlbGVtZW50KXtcblxuICAgIHRoaXMuZWxlbWVudHMucHVzaChlbGVtZW50KTtcbn07XG5cbkNvbnRhaW5lci5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uKGNiLCBvYmope1xuXG4gIHZhciBwcm9taXNlcyA9IFtdO1xuICBmb3IodmFyIGUgaW4gdGhpcy5lbGVtZW50cyl7XG4gICAgICB2YXIgZWxlbWVudCA9IHRoaXMuZWxlbWVudHNbZV07XG4gICAgICB2YXIgZGVmID0gbmV3ICQuRGVmZXJyZWQoZnVuY3Rpb24oZGVmKXtcbiAgICAgICAgICBlbGVtZW50LmlzVmFsaWQoZnVuY3Rpb24ocmVzKXsgZGVmLnJlc29sdmUocmVzKTsgfSwgb2JqKTtcbiAgICAgIH0pO1xuICAgICAgcHJvbWlzZXMucHVzaChkZWYpO1xuICB9XG5cbiAgJC53aGVuLmFwcGx5KHVuZGVmaW5lZCwgcHJvbWlzZXMpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7XG5cbiAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIGNiKGFyZ3MuaW5kZXhPZihmYWxzZSkgPCAwKTtcbiAgfSk7XG59O1xuXG5Db250YWluZXIucHJvdG90eXBlLmdldFZhbHVlcyA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIHZhbHVlcyA9IHt9O1xuICBmb3IodmFyIGUgaW4gdGhpcy5lbGVtZW50cyl7XG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRzW2VdO1xuICAgIHZhciBuYW1lICAgID0gISFlbGVtZW50Lm5hbWUgPyBlbGVtZW50Lm5hbWUgOiBlbGVtZW50LmF0dHIoJ25hbWUnKTtcbiAgICBpZighIW5hbWUpICB2YWx1ZXNbbmFtZV0gPSBlbGVtZW50LmdldFZhbHVlKCk7XG4gIH1cblxuICByZXR1cm4gdmFsdWVzO1xufTtcbiIsInZhciBEZWNvcmF0b3IgPSBmdW5jdGlvbihlbGVtZW50LCBtc2cpIHtcblxuICAgIGlmKGVsZW1lbnQudmFsaWRhdG9ycykgcmV0dXJuIGVsZW1lbnQ7XG5cbiAgICBlbGVtZW50LnZhbGlkYXRvcnMgPSBbXTtcbiAgICBlbGVtZW50LmZpbHRlcnMgICAgPSBbXTtcblxuICAgIGlmKCFlbGVtZW50Lm5hbWUpIGVsZW1lbnQubmFtZSA9IGVsZW1lbnQuYXR0cignbmFtZScpO1xuXG4gICAgZWxlbWVudC5hZGRWYWxpZGF0b3IgPSBmdW5jdGlvbih2YWxpZGF0b3Ipe1xuICAgICAgICB0aGlzLnZhbGlkYXRvcnMucHVzaCh2YWxpZGF0b3IpO1xuICAgIH07XG5cbiAgICBlbGVtZW50LmFkZEZpbHRlciA9IGZ1bmN0aW9uKGZpbHRlcil7XG4gICAgICAgIHRoaXMuZmlsdGVyLnB1c2goZmlsdGVyKTtcbiAgICB9O1xuXG4gICAgZWxlbWVudC5nZXRWYWx1ZSA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy52YWwoKS50cmltKCk7XG4gICAgICAgIGZvcih2YXIgZiBpbiB0aGlzLmZpbHRlcnMpe1xuXG4gICAgICAgICAgdmFyIGZpbHRlciA9IHRoaXMuZmlsdGVyc1tmXTtcbiAgICAgICAgICB2YXIgdmFsdWUgID0gZmlsdGVyLmZpbHRlcih2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcblxuICAgIGVsZW1lbnQuaXNWYWxpZCA9IGZ1bmN0aW9uKGNiLCBvYmopIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciByZXMgPSB0cnVlO1xuICAgICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuICAgICAgICBpZiAobXNnKSBtc2cudGV4dCgnJyk7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKTtcblxuICAgICAgICBmb3IodmFyIHYgaW4gdGhpcy52YWxpZGF0b3JzKXtcbiAgICAgICAgICAgIHZhciB2YWxpZGF0b3IgPSB0aGlzLnZhbGlkYXRvcnNbdl07XG4gICAgICAgICAgICB2YXIgZGVmID0gbmV3ICQuRGVmZXJyZWQoZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdG9yLmlzVmFsaWQodmFsdWUsIGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlcyAmJiBtc2cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZy50ZXh0KHZhbGlkYXRvci5tc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaW52YWxpZCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRlZi5yZXNvbHZlKHJlcyk7XG4gICAgICAgICAgICAgICAgfSwgb2JqKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJvbWlzZXMucHVzaChkZWYpO1xuICAgICAgICB9XG5cblxuICAgICAgICAkLndoZW4uYXBwbHkodW5kZWZpbmVkLCBwcm9taXNlcykucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGlmIChhcmdzLmluZGV4T2YoZmFsc2UpID49IDApIHtcbiAgICAgICAgICAgICAgICBjYihmYWxzZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNiKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGVsZW1lbnQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERlY29yYXRvcjtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnQ29udGFpbmVyJzogICAgICAgICByZXF1aXJlKCcuL2NvbnRhaW5lcicpLFxuICAnRGVjb3JhdG9yJzogICAgICAgICByZXF1aXJlKCcuL2RlY29yYXRvcicpLFxuICAnQ2hlY2tlZCc6ICAgICAgICAgICByZXF1aXJlKCcuL2NoZWNrZWQnKSxcbiAgJ05vdEVtcHR5JzogICAgICAgICAgcmVxdWlyZSgnLi9ub3RFbXB0eScpLFxuICAnTm90RW1wdHlEZXBlbmRlbnQnOiByZXF1aXJlKCcuL25vdEVtcHR5RGVwZW5kZW50JyksXG59O1xuIiwidmFyIE5vdEVtcHR5ID0gZnVuY3Rpb24oKXtcblxuICAgIHRoaXMubXNnID0gJ0NhbXBvIG9icmlnYXTDs3Jpbyc7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBOb3RFbXB0eTtcblxuTm90RW1wdHkucHJvdG90eXBlLmlzVmFsaWQgPSBmdW5jdGlvbih2YWx1ZSwgY2Ipe1xuXG4gICAgdmFyIHZhbHVlID0gdmFsdWUudHJpbSgpO1xuICAgIGlmKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PSAnJyl7XG4gICAgICAgIHJldHVybiBjYihmYWxzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNiKHRydWUpO1xufTtcbiIsInZhciBOb3RFbXB0eURlcGVuZGVudCA9IGZ1bmN0aW9uKGRlcCl7XG5cbiAgICB0aGlzLmRlcGVuZGVudCA9IGRlcDtcbiAgICB0aGlzLm1zZyA9ICdDYW1wbyBvYnJpZ2F0w7NyaW8nO1xufTtcbm1vZHVsZS5leHBvcnRzID0gTm90RW1wdHlEZXBlbmRlbnQ7XG5cbk5vdEVtcHR5RGVwZW5kZW50LnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24odmFsdWUsIGNiKXtcbiAgICBpZih2YWx1ZSA9PSAnJyl7XG4gICAgICAgIHZhciBkZXAgPSB0aGlzLmRlcGVuZGVudC52YWwoKTtcbiAgICAgICAgaWYoZGVwICE9ICcnKSByZXR1cm4gY2IoZmFsc2UpO1xuICAgIH1cblxuICAgIHJldHVybiBjYih0cnVlKTtcbn07XG4iLCJ2YXIgVmlldyA9IHJlcXVpcmUoJy4uL3ZpZXcnKTtcblxudmFyIGJhc2UgPSBmdW5jdGlvbigpe1xuXG4gIHRoaXMubGlzdCAgICAgID0gW107XG4gIHRoaXMubmFtZSAgICAgID0gISFuYW1lID8gbmFtZSA6ICcnO1xuICB0aGlzLmxhYmVsICAgICA9ICcnO1xuICB0aGlzLnZhbHVlICAgICA9IG51bGw7XG4gIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbn07XG5iYXNlLnByb3RvdHlwZSA9IG5ldyBWaWV3O1xuYmFzZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBiYXNlO1xubW9kdWxlLmV4cG9ydHMgPSBiYXNlO1xuXG5iYXNlLnByb3RvdHlwZS5zZXRMYWJlbCA9IGZ1bmN0aW9uKGxhYmVsKXtcbiAgdGhpcy5sYWJlbCA9IGxhYmVsO1xufTtcblxuYmFzZS5wcm90b3R5cGUudmFsID0gZnVuY3Rpb24odmFsdWUpe1xuXG4gIGlmKHZhbHVlID09PSB1bmRlZmluZWQpe1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9ZWxzZXtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5tYWtlSW5wdXRzKCk7XG4gIH1cbn07XG5cbmJhc2UucHJvdG90eXBlLmF0dHIgICAgICAgID0gZnVuY3Rpb24oKXsgLypmb3Igb3ZlcndyaXRlKi8gfTtcbmJhc2UucHJvdG90eXBlLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24oKXsgLypmb3Igb3ZlcndyaXRlKi8gfTtcbmJhc2UucHJvdG90eXBlLm1ha2VJbnB1dHMgID0gZnVuY3Rpb24oKXsgLypmb3Igb3ZlcndyaXRlKi8gfTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnQmFzZSc6ICAgICAgICAgIHJlcXVpcmUoJy4vYmFzZScpLFxuICAnUmFkaW8nOiAgICAgICAgIHJlcXVpcmUoJy4vcmFkaW8nKSxcbiAgJ1RleHRNdWx0aVJvdyc6ICByZXF1aXJlKCcuL3RleHRNdWx0aVJvdycpLFxufTtcbiIsInZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG5cbnZhciB2aWV3ID0gZnVuY3Rpb24obmFtZSl7XG5cbiAgdGhpcy5saXN0ICAgICAgPSBbXTtcbiAgdGhpcy5uYW1lICAgICAgPSAhIW5hbWUgPyBuYW1lIDogJyc7XG4gIHRoaXMudGl0bGUgICAgID0gJyc7XG4gIHRoaXMudmFsdWUgICAgID0gJyc7XG4gIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbn07XG52aWV3LnByb3RvdHlwZSA9IG5ldyBCYXNlO1xudmlldy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSB2aWV3O1xubW9kdWxlLmV4cG9ydHMgPSB2aWV3O1xuXG52aWV3LnByb3RvdHlwZS5zZXRUaXRsZSA9IGZ1bmN0aW9uKHRpdGxlKXtcbiAgdGhpcy50aXRsZSA9IHRpdGxlO1xufTtcblxudmlldy5wcm90b3R5cGUubWFrZSA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIGRpdiA9IENFKCdkaXYnLCAnYm94Jyk7XG5cbiAgdmFyIGxhYmVsID0gQ0UoJ2xhYmVsJywgJ2l0ZW0nLCAnaXRlbS1pbnB1dCcsICdpdGVtLXN0YWNrZWQtbGFiZWwnKTtcbiAgZGl2LmFwcGVuZChsYWJlbCk7XG5cbiAgdmFyIHRpdGxlID0gQ0UoJ3NwYW4nLCAnd2RsJykudGV4dCh0aGlzLnRpdGxlKTtcbiAgbGFiZWwuYXBwZW5kKHRpdGxlKTtcblxuICB0aGlzLm1lc3NhZ2UgPSBDRSgnc3BhbicsICd3ZGwnLCAnZXJyb3InKTtcbiAgbGFiZWwuYXBwZW5kKHRoaXMubWVzc2FnZSk7XG5cbiAgdGhpcy5jb250YWluZXIgPSBDRSgnZGl2JywgJ2JveCcpO1xuICB0aGlzLm1ha2VJbnB1dHMoKTtcbiAgZGl2LmFwcGVuZCh0aGlzLmNvbnRhaW5lcik7XG5cbiAgcmV0dXJuIGRpdjtcbn07XG5cbnZpZXcucHJvdG90eXBlLm1ha2VJbnB1dHMgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5jb250YWluZXIuaHRtbCgnJyk7XG5cbiAgZm9yKHZhciB4IGluIHRoaXMubGlzdCl7XG5cbiAgICB2YXIga2V5ICAgPSB0aGlzLmxpc3RbeF1bMF07XG4gICAgdmFyIGxhYmVsID0gdGhpcy5saXN0W3hdWzFdO1xuXG4gICAgdmFyIGlucHV0ID0gQ0UoJ2lucHV0JykuYXR0cih7dHlwZTogJ3JhZGlvJywgbmFtZTogdGhpcy5uYW1lLCB2YWx1ZToga2V5fSk7XG4gICAgaW5wdXQuY3NzKHtmbG9hdDogJ3JpZ2h0Jywgd2lkdGg6ICczMHB4JywgaGVpZ2h0OiAnMmVtJywgYm9yZGVyOiAnMHB4J30pO1xuICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZChDRSgnbGFiZWwnLCAnaXRlbScpLnRleHQobGFiZWwpLmFwcGVuZChpbnB1dCkpO1xuXG4gICAgaWYodGhpcy52YWx1ZSA9PSBrZXkpIGlucHV0LmF0dHIoJ2NoZWNrZWQnLCAnY2hlY2tlZCcpO1xuICB9XG5cbiAgdGhpcy5jb250YWluZXIuY2hhbmdlKGZ1bmN0aW9uKCl7IHNlbGYudmFsdWUgPSBzZWxmLmNvbnRhaW5lci5maW5kKCc6Y2hlY2tlZCcpLnZhbCgpOyB9KTtcbn07XG5cbnZpZXcucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGtleSwgbGFiZWwpe1xuICB0aGlzLmxpc3QucHVzaChba2V5LCBsYWJlbF0pO1xufTtcbiIsInZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG5cbnZhciB2aWV3ID0gZnVuY3Rpb24obmFtZSl7XG5cbiAgdGhpcy5saXN0ICAgICAgPSBbXTtcbiAgdGhpcy5uYW1lICAgICAgPSAhIW5hbWUgPyBuYW1lIDogJyc7XG4gIHRoaXMudGl0bGUgICAgID0gJyc7XG4gIHRoaXMudmFsdWUgICAgID0gJyc7XG4gIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgdGhpcy5zZXF1ZW5jZSAgPSAwO1xufTtcbnZpZXcucHJvdG90eXBlID0gbmV3IEJhc2U7XG52aWV3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHZpZXc7XG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7XG5cbnZpZXcucHJvdG90eXBlLnNldFRpdGxlID0gZnVuY3Rpb24odGl0bGUpe1xuICB0aGlzLnRpdGxlID0gdGl0bGU7XG59O1xuXG52aWV3LnByb3RvdHlwZS5tYWtlID0gZnVuY3Rpb24oKXtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdmFyIGRpdiA9IENFKCdkaXYnLCAnZm9ybS1ncm91cCcpO1xuICB2YXIgbGFiZWwgPSBDRSgnbGFiZWwnKS50ZXh0KHRoaXMudGl0bGUpO1xuICBkaXYuYXBwZW5kKGxhYmVsKTtcblxuICB0aGlzLmlucHV0ID0gQ0UoJ2lucHV0JywgJ2Zvcm0tY29udHJvbCcpLmF0dHIoe3R5cGU6ICd0ZXh0J30pO1xuICB0aGlzLmlucHV0LmZvY3Vzb3V0KGZ1bmN0aW9uKCl7IHNlbGYuYWRkLmNhbGwoc2VsZik7IH0pO1xuICBkaXYuYXBwZW5kKHRoaXMuaW5wdXQpO1xuXG4gIHRoaXMubGlzdCA9IENFKCdkaXYnLCAnYm94Jyk7XG4gIGRpdi5hcHBlbmQodGhpcy5saXN0KTtcblxuICB0aGlzLm91dHB1dCA9IENFKCdpbnB1dCcpLmF0dHIoe3R5cGU6ICdoaWRkZW4nLCBuYW1lOiB0aGlzLm5hbWV9KTtcbiAgZGl2LmFwcGVuZCh0aGlzLm91dHB1dCk7XG5cbiAgcmV0dXJuIGRpdjtcbn07XG5cbnZpZXcucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIGZvdW5kID0gZmFsc2U7XG5cbiAgdmFyIHRleHQgID0gdGhpcy5pbnB1dC52YWwoKS50cmltKCk7XG4gIGlmKHRleHQgPT0gJycpIHJldHVybjtcblxuICB2YXIgcm93aWQgPSBwYXJzZUludCh0aGlzLmlucHV0LmF0dHIoJ3Jvd2lkJykpO1xuXG4gIGlmKGlzTmFOKHJvd2lkKSkgcm93aWQgPSAtLXRoaXMuc2VxdWVuY2U7XG5cbiAgdmFyIHZhbHVlcyA9IHRoaXMuZ2V0VmFsdWVzKCk7XG4gIGZvcih2YXIgdiBpbiB2YWx1ZXMpe1xuICAgIHZhciB2YWx1ZSA9IHZhbHVlc1t2XTtcbiAgICBpZih2YWx1ZS5pZCA9PSByb3dpZCl7XG4gICAgICBmb3VuZCA9IHRydWU7XG4gICAgICB2YWx1ZXNbdl0udmFsdWUgPSB0ZXh0O1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYoIWZvdW5kKXtcbiAgICB2YWx1ZXMucHVzaCh7aWQ6IHJvd2lkLCB2YWx1ZTogdGV4dH0pO1xuICB9XG5cbiAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcbiAgdGhpcy5yZWZyZXNoKHZhbHVlcyk7XG4gIHRoaXMuY2xlYXJfaW5wdXQoKTtcbiAgdGhpcy5pbnB1dC5mb2N1cygpO1xufTtcblxudmlldy5wcm90b3R5cGUuY2xlYXJfaW5wdXQgPSBmdW5jdGlvbigpe1xuICB0aGlzLmlucHV0LnZhbCgnJyk7XG4gIHRoaXMuaW5wdXQuYXR0cigncm93aWQnLCAnJyk7XG59O1xuXG52aWV3LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24odmFsdWVzKXtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdGhpcy5saXN0Lmh0bWwoJycpO1xuICB2YXIgZGl2ID0gQ0UoJ2RpdicsICdib3gnKS5jc3Moeydib3JkZXInOiAnMXB4IHNvbGlkICNjY2MnLCAnbWFyZ2luLXRvcCc6ICc1cHgnfSk7XG4gIHRoaXMubGlzdC5hcHBlbmQoZGl2KTtcblxuICB2YXIgdmFsdWVzID0gISF2YWx1ZXMgPyB2YWx1ZXMgOiB0aGlzLmdldFZhbHVlcygpO1xuXG4gIGlmKHZhbHVlcy5sZW5ndGggPT0gMCl7XG4gICAgZGl2LnJlbW92ZSgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZvcih2YXIgdiBpbiB2YWx1ZXMpe1xuICAgIHZhciB2YWx1ZSA9IHZhbHVlc1t2XTtcbiAgICB2YXIgcm93ICAgPSBDRSgnZGl2JywgJ2JveCcpLmNzcyh7J2JvcmRlci1ib3R0b20nOiAnMXB4IHNvbGlkICNjY2MnLCAncGFkZGluZyc6ICc1cHgnfSkuYXR0cigncm93aWQnLCB2YWx1ZS5pZCk7XG4gICAgZGl2LmFwcGVuZChyb3cpO1xuICAgIHZhciB0ZXh0ICA9IENFKCdzcGFuJywgJ2xlZnQnKS50ZXh0KHZhbHVlLnZhbHVlKTtcbiAgICByb3cuYXBwZW5kKHRleHQpO1xuXG4gICAgKGZ1bmN0aW9uKHZhbHVlKXtcblxuICAgICAgdmFyIGRlbCAgPSBDRSgnYnV0dG9uJywgJ2J0bicsICdidG4tZGFuZ2VyJywgJ2J0bi14cycsICdyaWdodCcpLmF0dHIoe3R5cGU6ICdidXR0b24nfSkudGV4dCgnQXBhZ2FyJyk7XG4gICAgICBkZWwuY2xpY2soZnVuY3Rpb24oKXsgc2VsZi5kZWxldGUuY2FsbChzZWxmLCB2YWx1ZS5pZCkgfSk7XG4gICAgICByb3cuYXBwZW5kKGRlbCk7XG5cbiAgICAgIHZhciBlZGl0ID0gQ0UoJ2J1dHRvbicsICdidG4nLCAnYnRuLXdhcm5pbmcnLCAnYnRuLXhzJywgJ3JpZ2h0JykuYXR0cih7dHlwZTogJ2J1dHRvbid9KS50ZXh0KCdFZGl0YXInKTtcbiAgICAgIGVkaXQuY2xpY2soZnVuY3Rpb24oKXsgc2VsZi5lZGl0LmNhbGwoc2VsZiwgdmFsdWUuaWQpIH0pO1xuICAgICAgcm93LmFwcGVuZChlZGl0KTtcblxuICAgIH0pKHZhbHVlKTtcbiAgfTtcbn07XG5cbnZpZXcucHJvdG90eXBlLmVkaXQgPSBmdW5jdGlvbihpZCl7XG5cbiAgdmFyIHZhbHVlcyA9IHRoaXMuZ2V0VmFsdWVzKCk7XG4gIHZhciBzZWxmICAgPSB0aGlzO1xuXG4gIGZvcih2YXIgdiBpbiB2YWx1ZXMpe1xuICAgIHZhciB2YWx1ZSA9IHZhbHVlc1t2XTtcbiAgICBpZih2YWx1ZS5pZCA9PSBpZCl7XG4gICAgICBzZWxmLmlucHV0LnZhbCh2YWx1ZS52YWx1ZSk7XG4gICAgICBzZWxmLmlucHV0LmF0dHIoJ3Jvd2lkJywgdmFsdWUuaWQpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59O1xuXG52aWV3LnByb3RvdHlwZS5kZWxldGUgPSBmdW5jdGlvbihpZCl7XG5cbiAgdmFyIHZhbHVlcyA9IHRoaXMuZ2V0VmFsdWVzKCk7XG4gIHZhciBzZWxmICAgPSB0aGlzO1xuXG4gIGZvcih2YXIgdiBpbiB2YWx1ZXMpe1xuICAgIHZhciB2YWx1ZSA9IHZhbHVlc1t2XTtcbiAgICBpZih2YWx1ZS5pZCA9PSBpZCl7XG5cbiAgICAgIHZhbHVlcy5zcGxpY2UodiwgMSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB0aGlzLnNldFZhbHVlcyh2YWx1ZXMpO1xuICB0aGlzLnJlZnJlc2goKTtcbn07XG5cbnZpZXcucHJvdG90eXBlLmdldFZhbHVlcyA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIGpzb25fZGF0YSA9IHRoaXMub3V0cHV0LnZhbCgpO1xuICBpZihqc29uX2RhdGEgPT0gJycpIGpzb25fZGF0YSA9ICdbXSc7XG4gIHJldHVybiBKU09OLnBhcnNlKGpzb25fZGF0YSk7XG59O1xuXG52aWV3LnByb3RvdHlwZS5zZXRWYWx1ZXMgPSBmdW5jdGlvbih2YWx1ZXMpe1xuXG4gIHZhciBqc29uX2RhdGEgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZXMpO1xuICB0aGlzLm91dHB1dC52YWwoanNvbl9kYXRhKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ1ZpZXcnOiAgIHJlcXVpcmUoJy4vdmlldycpLFxuICAnZmllbGQnOiAgcmVxdWlyZSgnLi9maWVsZC9pbmRleCcpLFxufTtcbiIsInZhciBDRSA9IGZ1bmN0aW9uKHRhZyl7XG5cbiAgICB2YXIgZWxlbWVudCA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpKTtcbiAgICBmb3IodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcyhhcmd1bWVudHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudDtcbn07XG53aW5kb3cuQ0UgPSBDRTtcblxudmFyIGJhc2UgPSBmdW5jdGlvbihDKXtcblxuICAgIHRoaXMucG9zX21ha2UgPSBbXTtcbiAgICB0aGlzLnByZV9tYWtlID0gW107XG4gICAgdGhpcy5DID0gQzsgLy9Db250cm9sbGVyXG59XG5cbmJhc2UucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXIoKTtcbn07XG5cbmJhc2UucHJvdG90eXBlLm1ha2UgICAgID0gZnVuY3Rpb24oKXt9O1xuXG5iYXNlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpe1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgJC5lYWNoKHRoaXMucHJlX21ha2UsIGZ1bmN0aW9uKGssIHYpeyB2LmNhbGwoc2VsZik7IH0pO1xuICAgIHZhciByZW5kZXIgPSB0aGlzLm1ha2UoKTtcbiAgICAkLmVhY2godGhpcy5wb3NfbWFrZSwgZnVuY3Rpb24oaywgdil7IHYuY2FsbChzZWxmKTsgfSk7XG4gICAgcmV0dXJuIHJlbmRlcjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZTtcbiJdfQ==
