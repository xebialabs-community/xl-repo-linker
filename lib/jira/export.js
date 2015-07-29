var XlreConfig = require('../common/config');
var XlreSnapshot = require('../services/snapshot');
var fs = require('fs');
var jira = require('./api');
var path = require('path');
var Q = require('q');
var _ = require('lodash-node/compat');

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