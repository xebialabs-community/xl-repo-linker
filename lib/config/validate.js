var jiraPick = require('../jira/pick');
var XlreCache = require('../common/cache');
var XlreConfig = require('../common/config');
var XlreXld = require('../common/xld');

var fs = require('fs');
var Q = require('q');
var _ = require('lodash-node/compat');

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var XlreConfigValidate = function () {
};

XlreConfigValidate.prototype.checkConfigWithPromise = function (options, mode) {
    var deferred = Q.defer();
    XlreConfigValidate.prototype.checkConfig(options, mode, deferred);
    return deferred.promise;
};

XlreConfigValidate.prototype.checkConfig = function (options, mode, deferred) {
    XlreConfig.encodePlainTextPasswords();

    XlreConfigValidate.prototype.checkMode(mode, deferred);
    XlreConfigValidate.prototype.checkXldLicense(deferred);
    XlreConfigValidate.prototype.checkMongo(mode, deferred);
    XlreConfigValidate.prototype.checkGoogleDrive(mode, deferred);
    XlreConfigValidate.prototype.checkXld(options, deferred);

    XlreConfigValidate.prototype.checkJira(mode, deferred);

    if (deferred.promise.inspect().state === "pending") {
        jiraCredentials(deferred);
    }
};

XlreConfigValidate.prototype.checkGoogleDrive = function (mode, deferred) {
    if (mode !== "google-drive") {
        return;
    }

    if (!XlreConfig.getKeyValue('googleDrive.clientId')) {
        deferred.reject({
            configValidation: 'Please specify your google drive clientId.',
            fields: ['googleDrive.clientId']
        });
    }

    if (!XlreConfig.getKeyValue('googleDrive.clientSecret')) {
        deferred.reject({
            configValidation: 'Please specify your google drive clientSecret.',
            fields: ['googleDrive.clientSecret']
        });
    }
};

XlreConfigValidate.prototype.checkMongo = function (mode, deferred) {
    if (mode !== "google-drive") {
        return;
    }

    if (!XlreConfig.getKeyValue('mongo.apiKey')) {
        deferred.reject({configValidation: 'Please specify your mongo apiKey.', fields: ['mongo.apiKey']});
    }
};

XlreConfigValidate.prototype.checkXldLicense = function (deferred) {
    var xldLicensePath = XlreConfig.getKeyValue('xld.license');

    if (!xldLicensePath) {
        deferred.reject({
            configValidation: 'Please specify the location of your XL Deploy license.',
            fields: ['xld.license']
        });
    } else if (!fs.existsSync(xldLicensePath) || !fs.lstatSync(xldLicensePath).isFile()) {
        deferred.reject({
            configValidation: "XL License path is wrong. Please check your configuration",
            fields: ['xld.license']
        });
    }
};

XlreConfigValidate.prototype.checkXld = function (options, deferred) {
    if (!XlreConfig.getKeyValue('xld.home') && !XlreCache.fetch('xldHome')) {
        deferred.reject({configValidation: 'Please specify the location of your XLD instance.', fields: ['xld.home']});
    } else if (!XlreConfig.getKeyValue('xld.login') && options && options.checkXldCredentials) {
        deferred.reject({configValidation: 'Please specify your login to XLD.', fields: ['xld.login']});
    } else if (!XlreConfig.getKeyValue('xld.password') && options && options.checkXldCredentials) {
        deferred.reject({configValidation: 'Please specify your password to XLD.', fields: ['xld.password']});
    }

    XlreXld.checkXldFolder(deferred);
};

XlreConfigValidate.prototype.checkMode = function (mode, deferred) {
    if (!_.contains(['local', 'jira', 'google-drive'], mode)) {
        deferred.reject({
            configValidation: 'Please check your mode value, valid values are [local, jira, google-drive]',
            fields: ['common.mode']
        });
    }
};

XlreConfigValidate.prototype.checkJira = function (mode, deferred) {
    if (mode !== "jira") {
        return true;
    }

    if (!XlreConfig.getKeyValue('jira.login')) {
        deferred.reject({configValidation: 'Please specify your login to Jira.', fields: ['jira.login']});
    } else if (!XlreConfig.getKeyValue('jira.password')) {
        deferred.reject({configValidation: 'Please specify your password to Jira.', fields: ['jira.password']});
    }
};

var jiraCredentials = function (deferred) {
    if (XlreConfig.getMode() !== "jira") {
        deferred.resolve();
    } else {
        jiraPick.execute('ping', true, true).then(function (message) {
            deferred.resolve(JSON.parse(message).sections[0].issues);
        }, function (err) {
            if (err.response && err.response.statusCode === 401) {
                deferred.reject({
                    configValidation: 'Please check your Jira credentials',
                    fields: ['jira.password', 'jira.login']
                });
            } else {
                deferred.reject(err);
            }
        });
    }
};

module.exports = new XlreConfigValidate();