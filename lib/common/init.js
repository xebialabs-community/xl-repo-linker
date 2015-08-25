var XlreCache = require('./cache');
var XlreNetwork = require('./network');

var Q = require('q');

var XlreInit = function () {
};

XlreInit.prototype.initValues = function () {
    var deferred = Q.defer();

    XlreNetwork.findNetworkIp(function (error, ip) {
        if (error) {
            deferred.reject(error);
        } else {
            XlreCache.store('xlre-ip', ip);
            deferred.resolve(ip);
        }
    }, false);

    return deferred.promise;
};

module.exports = new XlreInit();