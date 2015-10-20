var XlreSnapshot = require('../services/snapshot');
var jira = require('./api');
var Q = require('q');

var XlreExport = function () {
};

XlreExport.prototype.execute = function (issue, force) {
    var deferred = Q.defer();

    XlreSnapshot.create().then(function (zipFilePath) {
        jira.uploadAttachment(zipFilePath, issue, force).then(function (data) {
            deferred.resolve(data);
        }, function (errorMessage) {
            deferred.reject(errorMessage);
        });
    }).catch(function (err) {
        deferred.reject(err);
    });

    return deferred.promise;
};

module.exports = new XlreExport();