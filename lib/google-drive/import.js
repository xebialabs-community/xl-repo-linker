var api = require('./api');
var cache = require('../common/cache');
var XlreSnapshot = require('../services/snapshot');

var temp = require('temp');
temp.track();

var Q = require('q');

var XlreImport = function () {
};

XlreImport.prototype.execute = function (name, restart) {
    var deferred = Q.defer();
    api.authToDownloadFile({title: name, restart: restart});
    deferred.resolve('Import from Google Drive is in progress...');
    return deferred.promise;
};

XlreImport.prototype.start = function (auth) {
    api.downloadFile(auth).then(function (archivedFilePath) {
        var fileToDownload = cache.fetch('fileToDownload');
        var snapshotPath = temp.mkdirSync();
        return XlreSnapshot.copyToXld(fileToDownload.title, snapshotPath, archivedFilePath, fileToDownload.restart);
    }).then(function (res) {
        console.log(res);
    }).catch(function(err) {
        console.error(err);
    }).fin(function() {
        process.exit(0);
    });
};

module.exports = new XlreImport();