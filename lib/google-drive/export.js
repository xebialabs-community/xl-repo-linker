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

    XlreSnapshot.create().then(function (zipFilePath) {
        api.authToUploadFile({title: fileTitle, path: zipFilePath});
        deferred.resolve('Export to Google Drive is in progress...');
    }).catch(function (err) {
        deferred.reject(err);
    });

    return deferred.promise;
};

XlreExport.prototype.start = function (auth) {
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