var XlreConfig = require('../common/config.js');
var Logging = require('../common/logging.js');
var fs = require('fs');
var jira = require('../jira/');
var archiver = require('archiver');
var path = require('path');
var rimraf = require('rimraf');
var Q = require('q');
var services = require('./index.js');
var _ = require('lodash-node/compat');

var archive = archiver('zip');

var XlreExport = function () {
};

XlreExport.prototype.execute = function (issue, force) {
    var deferred = Q.defer();

    var manifestPlugin = services.manifest.createManifestForPlugins();
    var xldLocation = XlreConfig.getXldLocation();
    var folderLibs = ['conf', 'ext', 'repository'];
    var zipFilePath = xldLocation + path.sep + 'xld-snapshot.zip';

    var output = fs.createWriteStream(xldLocation + path.sep + 'xld-snapshot.zip');
    output.on('close', function() {

        function cleanTempFiles() {
            rimraf(zipFilePath, Logging.logError);
            rimraf(manifestPlugin, Logging.logError);
        }

        jira.uploadAttachment(issue, force).then(function () {
            cleanTempFiles();
            deferred.resolve('XLD attachment has been successfully uploaded.');
        }, function (errorMessage) {
            cleanTempFiles();
            deferred.reject(errorMessage);
        });

    });

    archive.on('error', function(err) {
        deferred.reject(err);
    });

    archive.pipe(output);

    _(folderLibs).forEach(function (folderLib) {
        archive.directory(xldLocation + path.sep + folderLib, folderLib);
    }).value();

    archive.file(manifestPlugin, {name:'.plugins'});

    archive.finalize();

    return deferred.promise;
};

module.exports = new XlreExport();