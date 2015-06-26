var api = require('./api');

var Q = require('q');

var XlreImport = function () {
};

XlreImport.prototype.execute = function (name, overwrite) {
    var deferred = Q.defer();

    api.authToDownloadFile({title: name, overwrite: overwrite});

    return deferred.promise;
};

module.exports = new XlreImport();