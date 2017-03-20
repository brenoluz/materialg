var Decorator = function(element, msg) {

    if(element.validators) return element;

    element.validators = [];
    element.filters    = [];

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
