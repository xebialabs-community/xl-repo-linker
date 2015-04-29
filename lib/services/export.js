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
var temp = require('temp');
temp.track();

var XlreExport = function () {
};

XlreExport.prototype.execute = function (issue, force) {
    var deferred = Q.defer();

    var archive = archiver('zip');
    var tempFolder = temp.mkdirSync();
    var manifestPlugin = services.manifest.createManifestForPlugins(tempFolder);
    var folderLibs = ['conf', 'ext', 'repository'];
    var zipFilePath = tempFolder + path.sep + 'xld-snapshot.zip';

    var output = fs.createWriteStream(zipFilePath);
    output.on('close', function() {

        jira.uploadAttachment(zipFilePath, issue, force).then(function () {
            deferred.resolve('XLD attachment has been successfully uploaded.');
        }, function (errorMessage) {
            deferred.reject(errorMessage);
        });

    });

    archive.on('error', function(err) {
        deferred.reject(err);
    });

    archive.pipe(output);

    var xldLocation = XlreConfig.getXldLocation();
    _(folderLibs).forEach(function (folderLib) {
        archive.directory(xldLocation + path.sep + folderLib, folderLib);
    }).value();

    archive.file(manifestPlugin, {name:'.plugins'});

    archive.finalize();

    return deferred.promise;
};

module.exports = new XlreExport();