var XlreConfig = require('../common/config');
var XlreDb = require('../services/db');

var compareVersion = require('compare-version');
var packageJson = require('../../package.json');
var Q = require('q');

var XlreConfigUpgrade = function () {
};

XlreConfigUpgrade.prototype.run = function () {
    var deferred = Q.defer();
    var runningXlRepoLinkerVersion = packageJson.version;

    function upgrade(version) {
        var config = XlreConfig.readXlreConfig();

        if (!config.mongo) {
            XlreConfig.updateKey('mongo.apiKey', null);
        }

        if (!config.common) {
            XlreConfig.updateKey('common.mode', 'local');
        }

        if (!config.common.show_download_progress) {
            XlreConfig.updateKey('common.show_download_progress', 'true');
        }

        if (!config.xld.license) {
            XlreConfig.updateKey('xld.license', null);
        }

        if (!config.snapshot) {
            XlreConfig.updateKey('snapshot.conf', '**/*.*,!deployit-license.lic');
            XlreConfig.updateKey('snapshot.ext', '**/*.*');
            XlreConfig.updateKey('snapshot.repository', '**/*.*');
        }

        if (!version) {
            XlreDb.remove({key: 'google_drive_oauth_token'}).then(function () {
                deferred.resolve(runningXlRepoLinkerVersion);
            }).fail(function (err) {
                deferred.reject(err);
            });
        } else {
            deferred.resolve(runningXlRepoLinkerVersion);
        }
    }

    XlreDb.findOne({key: 'xl_repo_linker_version'}).then(function (version) {

        var newValue = {key: 'xl_repo_linker_version', value: runningXlRepoLinkerVersion};

        if (version) {
            if (compareVersion(runningXlRepoLinkerVersion, version.value) > 0) {
                XlreDb.update({key: 'xl_repo_linker_version'}, newValue).then(function () {
                    upgrade(version.value);
                }).fail(function (err) {
                    deferred.reject(err);
                });
            } else {
                deferred.resolve(version);
            }
        } else {
            XlreDb.insert(newValue).then(function () {
                upgrade();
            }).fail(function (err) {
                deferred.reject(err);
            });
        }
    });

    return deferred.promise;
};

module.exports = new XlreConfigUpgrade();