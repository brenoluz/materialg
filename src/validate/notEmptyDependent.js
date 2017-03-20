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
