var Files = require('../common/files');
var XlreConfig = require('../common/config');
var manifest = require('./manifest');
var XlDeploy = require('../services/xldeploy');
var XlreXld = require('../common/xld');

var archiver = require('archiver');
var colors = require('colors');
var Decompress = require('decompress');
var fs = require('fs');
var fsExtra = require('fs-extra');
var os = require('os');
var path = require('path');
var rimraf = require('rimraf');
var Q = require('q');
var _ = require('lodash-node/compat');

var temp = require('temp');
temp.track();

var XlreSnapshot = function () {
};

XlreSnapshot.prototype.create = function () {
    var deferred = Q.defer();

    var archive = archiver('zip');
    var tempFolder = temp.mkdirSync();

    var snapConfigs = XlreConfig.getSnapshotConfiguration();
    var zipFilePath = tempFolder + path.sep + 'xld-snapshot.zip';

    var output = fs.createWriteStream(zipFilePath);

    output.on('close', function () {
        deferred.resolve(zipFilePath);
    });

    archive.on('error', function (err) {
        deferred.reject(err);
    });

    archive.pipe(output);

    var bulkData = [];

    var xldLocation = XlreXld.getHome();
    _(snapConfigs).forEach(function (snapConfig) {
        var libFolder = _.keys(snapConfig)[0];
        var srcPattern = _.values(snapConfig)[0];

        var fullFolderPath = xldLocation + path.sep + libFolder;
        if (fs.existsSync(fullFolderPath)) {
            bulkData.push({expand: true, cwd: fullFolderPath, src: srcPattern.split(','), dest: libFolder});
        }
    }).value();

    archive.bulk(bulkData);

    archive.file(manifest.createManifestForPlugins(tempFolder), {name: '.plugins'});

    manifest.createVersionManifest(tempFolder).then(function (filePath) {
        archive.file(filePath, {name: '.xld'});
    }).fin(function () {
        archive.finalize();
    });

    return deferred.promise;
};

XlreSnapshot.prototype.copyToXld = function (name, archivePath, restart) {

    var deferred = Q.defer();
    var snapshotPath = temp.mkdirSync();

    function readAllArtifacts() {
        return fs.readdirSync(XlreXld.getPluginsFolder());
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
        var confFolder = XlreXld.getConfFolder();

        function startsWith(str, prefix) {
            return str.indexOf(prefix) === 0;
        }

        _(Files.walk(confFolder)).forEach(function (file) {
            if (startsWith(file, 'xld-wrapper')) {
                var dest = XlreXld.getConfFolder() + path.sep + file;
                var snapshotArchive = fs.createWriteStream(dest);

                fs.createReadStream(confFolder + path.sep + file).pipe(snapshotArchive);
                snapshotArchive.on('finish', function () {
                    fs.chmodSync(dest, '755');
                });
            }
        }).value();
    }

    function cleanFolders(xldHome) {
        var snapConfig = XlreConfig.getSnapshotConfiguration();
        _(snapConfig).forEach(function (folderLib) {
            var libFolder = _.keys(snapConfig)[0];
            rimraf.sync(xldHome + path.sep + libFolder);
        }).value();
    }

    function copySnapshotFiles(snapshotPath) {
        var deferred = Q.defer();

        var xldHome = XlreXld.getHome();

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

    var copy = function () {
        fsExtra.copy(XlreConfig.getLicense(), XlreXld.getLicensePath(), function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve('Attachment for [' + name + '] has been successfully imported.');
            }
        });
    };

    var decompress = new Decompress({mode: '755'})
        .src(archivePath)
        .dest(snapshotPath)
        .use(Decompress.zip());

    decompress.run(function (err) {
        if (err) {
            deferred.reject(err);
        } else {
            preserveWrapperConfigFiles();

            var pluginsDiff = findPluginDifferences(snapshotPath);
            if (!_.isEmpty(pluginsDiff)) {
                console.log(("Not found plugins for importing snapshot: " + pluginsDiff.toString()).yellow);
            }

            copySnapshotFiles(snapshotPath).then(function () {
                if (restart === "true") {
                    return XlDeploy.restartServer().then(copy());
                } else {
                    copy();
                }

            }, function (err) {
                deferred.reject(err.message);
            });
        }
    });

    return deferred.promise;
};

module.exports = new XlreSnapshot();