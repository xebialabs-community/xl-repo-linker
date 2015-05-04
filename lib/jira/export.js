var XlreConfig = require('../common/config');
var XlreSnapshot = require('../services/snapshot');
var Logging = require('../common/logging');
var fs = require('fs');
var jira = require('./api');
var archiver = require('archiver');
var path = require('path');
var rimraf = require('rimraf');
var Q = require('q');
var _ = require('lodash-node/compat');
var temp = require('temp');
temp.track();

var XlreExport = function () {
};

XlreExport.prototype.execute = function (issue, force) {
    var deferred = Q.defer();

    XlreSnapshot.create(issue, force, function(zipFilePath) {
        jira.uploadAttachment(zipFilePath, issue, force).then(function () {
            deferred.resolve('XLD attachment has been successfully uploaded.');
        }, function (errorMessage) {
            deferred.reject(errorMessage);
        });
    }, function(err) {
        deferred.reject(err);
    });

    return deferred.promise;
};

module.exports = new XlreExport();