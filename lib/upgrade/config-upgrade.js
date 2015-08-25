var XlreConfig = require('../common/config');
var XlreDb = require('../services/db');
var XlreImportToDB = require('./import-to-dB');

var compareVersion = require('compare-version');
var packageJson = require('../../package.json');
var Q = require('q');

var XlreConfigUpgrade = function () {
};

XlreConfigUpgrade.prototype.run = function () {
    var deferred = Q.defer();
    var runningXlRepoLinkerVersion = packageJson.version;

    function upgrade(version) {

        if (!XlreConfig.getGroupValue('mongo')) {
            XlreConfig.updateKeyValue('mongo.apiKey', null);
        }

        if (!XlreConfig.getGroupValue('common')) {
            XlreConfig.updateKeyValue('common.mode', 'local');
        }

        if (!XlreConfig.getKeyValue('common.show_download_progress')) {
            XlreConfig.updateKeyValue('common.show_download_progress', 'true');
        }

        if (!XlreConfig.getKeyValue('xld.license')) {
            XlreConfig.updateKeyValue('xld.license', null);
        }

        if (!XlreConfig.getGroupValue('snapshot')) {
            XlreConfig.updateKeyValue('snapshot.conf', '**/*.*,!deployit-license.lic');
            XlreConfig.updateKeyValue('snapshot.ext', '**/*.*');
            XlreConfig.updateKeyValue('snapshot.repository', '**/*.*');
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

    XlreImportToDB.run().then(function () {
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
    }).catch(function (err) {
        deferred.reject(err);
    });

    return deferred.promise;
};

module.exports = new XlreConfigUpgrade();