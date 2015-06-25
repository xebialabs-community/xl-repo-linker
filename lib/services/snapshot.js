var XlreConfig = require('../common/config');
var Logging = require('../common/logging');
var services = require('./index');

var archiver = require('archiver');
var Decompress = require('decompress');
var Files = require('../common/files');
var fs = require('fs');
var fsExtra = require('fs-extra');
var path = require('path');
var rimraf = require('rimraf');
var Q = require('q');
var XlDeploy = require('../services/xldeploy');
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

XlreSnapshot.prototype.copyToXld = function (name, snapshotPath, archivePath, restart) {

    var deferred = Q.defer();

    function readAllArtifacts() {
        var pluginsDir = XlreConfig.getXldLocation() + path.sep + "plugins";
        return fs.readdirSync(pluginsDir);
    }

    function findPluginDifferences(unpackedFolder) {
        var pluginsMetadataFile = unpackedFolder + path.sep + ".plugins";
        if (fs.existsSync(pluginsMetadataFile)) {
            var importedPluginList = _.without(fs.readFileSync(pluginsMetadataFile, {"encoding": "utf-8"}).split(os.EOL), '');
            var foundArtifacts = readAllArtifacts();
            return _.difference(importedPluginList, foundArtifacts);
        }
        return [];
    }


    function preserveWrapperConfigFiles() {
        var xldHome = XlreConfig.getXldLocation();
        var confFolder = xldHome + path.sep + "conf";

        function startsWith(str, prefix) {
            return str.indexOf(prefix) === 0;
        }

        _(Files.walk(confFolder)).forEach(function (file) {
            if (startsWith(file, 'xld-wrapper')) {
                var dest = xldHome + path.sep + 'xld-snapshot' + path.sep + 'conf' + path.sep + file;
                var snapshotArchive = fs.createWriteStream(dest);
                fs.createReadStream(confFolder + path.sep + file).pipe(snapshotArchive);
                snapshotArchive.on('finish', function () {
                    fs.chmodSync(dest, '755');
                });
            }
        }).value();
    }

    function cleanFolders(xldHome) {
        var folderLibs = ['conf', 'ext', 'repository'];
        _(folderLibs).forEach(function (folderLib) {
            rimraf.sync(xldHome + path.sep + folderLib);
        }).value();
    }

    function copySnapshotFiles(snapshotPath) {
        var deferred = Q.defer();

        var xldHome = XlreConfig.getXldLocation();

        cleanFolders(xldHome);

        fsExtra.copy(snapshotPath, xldHome, function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve('Copying of snapshot files are finished successfully');
            }
        });

        return deferred.promise;
    }

    var decompress = new Decompress({mode: '755'})
        .src(archivePath)
        .dest(snapshotPath)
        .use(Decompress.zip());

    decompress.run(function (err) {
        if (err) {
            deferred.reject(err);
        } else {
            preserveWrapperConfigFiles();
            //var pluginsDiff = findPluginDifferences(snapshotPath);
            //if (_.isEmpty(pluginsDiff)) { TODO: don't check plugin difference for now.
            copySnapshotFiles(snapshotPath).then(function () {
                if (restart) {
                    XlDeploy.restartServer();
                }
                deferred.resolve('Attachment for ' + name + ' has been successfully imported.');
            }, function (err) {
                deferred.reject(err.message);
            });
            //} else {
            //    deferred.reject('Found the next list of missing plugins: ' + pluginsDiff + '. Please install them before proceed further.');
            //}
        }
    });

    return deferred.promise;
};

module.exports = new XlreSnapshot();