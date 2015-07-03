var Files = require('../common/files');
var XlreConfig = require('../common/config');
var manifest = require('./manifest');
var XlDeploy = require('../services/xldeploy');
var XlreXld = require('../common/xld');

var archiver = require('archiver');
var Decompress = require('decompress');
var fs = require('fs');
var fsExtra = require('fs-extra');
var path = require('path');
var rimraf = require('rimraf');
var Q = require('q');
var _ = require('lodash-node/compat');

var temp = require('temp');
temp.track();

var XlreSnapshot = function () {
};

XlreSnapshot.prototype.includePlugins = function () {
    if (XlreConfig.getMode() === "local") {
        return XlreConfig.readXlreConfig().local.include_plugins;
    }
    return false;
};

XlreSnapshot.prototype.getSnapshotFolders = function () {
    var folderLibs = ['conf', 'ext', 'repository'];
    if (XlreSnapshot.prototype.includePlugins()) {
        folderLibs.push('plugins');
    }
    return folderLibs;
};

XlreSnapshot.prototype.create = function () {
    var deferred = Q.defer();

    var archive = archiver('zip');
    var tempFolder = temp.mkdirSync();

    var folderLibs = XlreSnapshot.prototype.getSnapshotFolders();
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
    _(folderLibs).forEach(function (folderLib) {
        var fullFolderPath = xldLocation + path.sep + folderLib;
        if (fs.existsSync(fullFolderPath)) {
            bulkData.push({expand: true, cwd: fullFolderPath, src: ['**', '!*.lic'], dest: folderLib});
        }
    }).value();

    archive.bulk(bulkData);

    if (!XlreSnapshot.prototype.includePlugins()) {
        var manifestPlugin = manifest.createManifestForPlugins(tempFolder);
        archive.file(manifestPlugin, {name: '.plugins'});
    }

    archive.finalize();

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
        var folderLibs = XlreSnapshot.prototype.getSnapshotFolders();
        _(folderLibs).forEach(function (folderLib) {
            rimraf.sync(xldHome + path.sep + folderLib);
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
                if (restart === "true") {
                    return XlDeploy.restartServer();
                }

                fsExtra.copy(XlreConfig.getLicense(), XlreXld.getLicensePath(), function (err) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve('Attachment for [' + name + '] has been successfully imported.');
                    }
                });

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