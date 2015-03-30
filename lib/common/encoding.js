var Encoding = function(){};

Encoding.prototype.isBase64 = function(value) {
    return /(?:[A-Za-z0-9+\/]{4}\\n?)*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)/.test(value);
};

Encoding.prototype.encode = function(value) {
    return new Buffer(value).toString('base64');
};

Encoding.prototype.decode = function(value) {
    return new Buffer(value, 'base64').toString('utf-8');
};

module.exports = new Encoding();