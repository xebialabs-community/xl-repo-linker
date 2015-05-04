var Logging = require('../common/logging');
var XlreConfig = require('../common/config');
var Files = require('../common/files');
var XlDeploy = require('../services/xldeploy');
var jira = require('./api');

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


var XlreImport = function () {
};

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

function copySnapshotFiles(snapshotPath) {
    var deferred = Q.defer();

    var xldHome = XlreConfig.getXldLocation();

    fsExtra.copy(snapshotPath, xldHome, function (err) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve('Copying of snapshot files are finished successfully');
        }
    });

    return deferred.promise;
}

XlreImport.prototype.execute = function (issue, restart) {
    var deferred = Q.defer();

    jira.downloadAttachment(issue).then(function (outcome) {

        var snapshotPath = outcome.snapshotPath;
        var archivePath = outcome.archivePath;

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
                    copySnapshotFiles(snapshotPath).then(function() {
                        if (restart) {
                            XlDeploy.restartServer();
                        }
                        deferred.resolve('Attachment has been successfully imported.');
                    }, function(err) {
                        deferred.reject(err.message);
                    });
                //} else {
                //    deferred.reject('Found the next list of missing plugins: ' + pluginsDiff + '. Please install them before proceed further.');
                //}
            }
        });
    }, function (err) {
        deferred.reject(err);
    });

    return deferred.promise;
};

module.exports = new XlreImport();