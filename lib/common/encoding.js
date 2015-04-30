var Encoding = function(){};

Encoding.prototype.encode = function(value) {
    return new Buffer(value).toString('base64');
};

Encoding.prototype.decode = function(value) {
    return new Buffer(value, 'base64').toString('utf-8');
};

module.exports = new Encoding();