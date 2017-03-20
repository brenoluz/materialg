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
