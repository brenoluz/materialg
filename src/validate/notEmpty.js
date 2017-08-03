var Base = require('./base');

var NotEmpty = function(){

    this.msg = 'Campo obrigatório';
};
NotEmpty.prototype = new Base;
NotEmpty.prototype.constructor = NotEmpty;
module.exports = NotEmpty;

NotEmpty.prototype.isValid = function(value, cb){

    var value = value.trim();
    if(value === null || value == undefined || value == ''){
        return cb(false);
    }

    return cb(true);
};
