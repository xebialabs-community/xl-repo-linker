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

    XlreSnapshot.create(fileTitle, force, function (zipFilePath) {
        api.authToUploadFile({title: fileTitle, path: zipFilePath});
        deferred.resolve('Export to Google Drive is in progress...');
    }, function(err) {
        deferred.reject(err);
    });

    return deferred.promise;
};

module.exports = new XlreExport();