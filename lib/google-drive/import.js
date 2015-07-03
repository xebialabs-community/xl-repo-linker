var api = require('./api');
var cache = require('../common/cache');
var XlreSnapshot = require('../services/snapshot');

var Q = require('q');

var XlreImport = function () {
};

XlreImport.prototype.execute = function (name, restart) {
    var deferred = Q.defer();

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

    api.downloadFile(auth).then(function (archivedFilePath) {
        var fileToDownload = cache.fetch('fileToDownload');

        return XlreSnapshot.copyToXld(fileToDownload.title, archivedFilePath, fileToDownload.restart);
    }).then(function (res) {
        console.log(res);
    }).catch(function(err) {
        console.error(err);
    }).fin(function() {
        process.exit(0);
    });
};

module.exports = new XlreImport();