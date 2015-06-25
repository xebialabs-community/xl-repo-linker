var Logging = require('../common/logging');
var XlreConfig = require('../common/config');
var Files = require('../common/files');
var XlreSnapshot = require('../services/snapshot');
var jira = require('./api');

var fs = require('fs');
var os = require('os');
var path = require('path');
var rimraf = require('rimraf');
var Q = require('q');
var _ = require('lodash-node/compat');
var temp = require('temp');

temp.track();

var XlreImport = function () {
};

XlreImport.prototype.execute = function (issue, restart) {
    var deferred = Q.defer();

    jira.downloadAttachment(issue).then(function (outcome) {

        var snapshotPath = outcome.snapshotPath;
        var archivePath = outcome.archivePath;

        XlreSnapshot.copyToXld(issue, snapshotPath, archivePath, restart).then(function (res) {
            deferred.resolve(res);
        }).catch(function (err) {
            deferred.reject(err);
        });

    }, function (err) {
        deferred.reject(err);
    });

    return deferred.promise;
};

module.exports = new XlreImport();