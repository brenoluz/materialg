var dateAtOrBelow = function(date){

    this.date = date;
    this.msg  = 'Data futura inválida';
};
module.exports = dateAtOrBelow;

dateAtOrBelow.prototype.isValid = function(value, cb){

    var value = new Date(value.split('-'));
    if(value.getTime() > this.date.getTime()) return cb(false);
    cb(true);
};
