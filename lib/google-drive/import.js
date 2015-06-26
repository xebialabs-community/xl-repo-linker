var Q = require('q');

var XlreImport = function () {
};

XlreImport.prototype.execute = function (fileTitle, force) {
    var deferred = Q.defer();

    return deferred.promise;
};

module.exports = new XlreImport();