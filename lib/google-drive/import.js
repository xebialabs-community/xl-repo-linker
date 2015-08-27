var api = require('./api');
var cache = require('../common/cache');
var XlreLogger = require('../common/logger');
var XlreSnapshot = require('../services/snapshot');

var Q = require('q');

var XlreImport = function () {
};

XlreImport.prototype.execute = function (name, restart, stopServer) {
    var deferred = Q.defer();

    cache.store('stopServer', stopServer);

    var fileToDownload = {title: name, restart: restart};
    cache.store('fileToDownload', fileToDownload);
    api.getTokenInfo().then(function (tokens) {
        XlreImport.prototype.start(tokens);
    }, function() {
        api.authToDownloadFile();
    }).then(function() {
        deferred.resolve('Import from Google Drive is in progress...');
    }).catch(function(err) {
        deferred.reject(err);
    });

    return deferred.promise;
};

XlreImport.prototype.start = function (tokens) {
    var auth = api.getOauth2();
    auth.credentials = tokens;

    api.downloadFile().then(function (archivedFilePath) {
        var fileToDownload = cache.fetch('fileToDownload');
        return XlreSnapshot.copyToXld(fileToDownload.title, archivedFilePath, fileToDownload.restart);
    }).then(function (res) {
        cache.store('importResult', '200,'  + res);
        XlreLogger.info(res);
    }).catch(function(err) {
        cache.store('importResult', '500,'  + err);
        XlreLogger.error(err);
    }).fin(function() {
        if (cache.fetch('stopServer')) {
            process.exit(0);
        }
    });
};

module.exports = new XlreImport();