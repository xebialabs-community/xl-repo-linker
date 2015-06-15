var XlreConfig = require('../common/config');
var Logging = require('../common/logging');
var services = require('./index');

var archiver = require('archiver');
var fs = require('fs');
var path = require('path');
var Q = require('q');
var _ = require('lodash-node/compat');

var temp = require('temp');
temp.track();

var XlreSnapshot = function () {
};

XlreSnapshot.prototype.create = function (issue, force, outputOnCloseCallback, archiveOnErrorCallback) {
    var deferred = Q.defer();

    var archive = archiver('zip');
    var tempFolder = temp.mkdirSync();
    var manifestPlugin = services.manifest.createManifestForPlugins(tempFolder);
    var folderLibs = ['conf', 'ext', 'repository'];
    var zipFilePath = tempFolder + path.sep + 'xld-snapshot.zip';

    var output = fs.createWriteStream(zipFilePath);

    output.on('close', function() {
        outputOnCloseCallback(zipFilePath);
    });

    archive.on('error', archiveOnErrorCallback);

    archive.pipe(output);

    var xldLocation = XlreConfig.getXldLocation();
    _(folderLibs).forEach(function (folderLib) {
        archive.directory(xldLocation + path.sep + folderLib, folderLib);
    }).value();

    archive.file(manifestPlugin, {name: '.plugins'});

    archive.finalize();

    return deferred.promise;
};

module.exports = new XlreSnapshot();