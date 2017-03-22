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
