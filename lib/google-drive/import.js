var api = require('./api');

var Q = require('q');

var XlreImport = function () {
};

XlreImport.prototype.execute = function (name, restart) {
    var deferred = Q.defer();

    api.authToDownloadFile({title: name, restart: restart});

    return deferred.promise;
};

module.exports = new XlreImport();