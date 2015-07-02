var api = require('./api');
var cache = require('../common/cache');
var XlreSnapshot = require('../services/snapshot');

var Q = require('q');

var temp = require('temp');
temp.track();

var XlreExport = function () {
};

XlreExport.prototype.execute = function (fileTitle, force) {
    var deferred = Q.defer();

    cache.store('stopServer', true);

    XlreSnapshot.create().then(function(zipFilePath) {
        var fileToUpload = {title: fileTitle, path: zipFilePath, force: force};
        cache.store('fileToUpload', fileToUpload);
        return fileToUpload;
    }).then(function() {
        return api.getTokenInfo();
    }).then(function (tokens) {
        XlreExport.prototype.start(tokens);
        deferred.resolve('Export to Google Drive is in progress...');
    }).fail(function() {
        api.authToUploadFile();
        deferred.resolve('Export to Google Drive is in progress...');
    }).catch(function (err) {
        deferred.reject(err);
    });

    return deferred.promise;
};

XlreExport.prototype.start = function (tokens) {
    var auth = api.getOauth2();
    auth.credentials = tokens;

    api.uploadFile(auth).then(function (data) {
        console.log(data);
    }).catch(function (err) {
        console.error(err);
    }).fin(function () {
        if (cache.fetch('stopServer')) {
            process.exit(0);
        }
    });
};

module.exports = new XlreExport();