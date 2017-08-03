var Base = require('../base');

var base = function(){};
base.prototype = new Base;
base.prototype.constructor = base;
module.exports = base;

