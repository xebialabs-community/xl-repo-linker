var jiraPick = require('../jira/pick');
var XlreConfig = require('../common/config');

var fs = require('fs');
var Q = require('q');
var _ = require('lodash-node/compat');

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var XlreConfigValidate = function () {
};

XlreConfigValidate.prototype.checkConfig = function (options) {
    var deferred = Q.defer();

    XlreConfig.createDefaultConfigFile();
    XlreConfig.encodePlainTextPasswords();

    XlreConfigValidate.prototype.checkXldLicense(deferred);
    XlreConfigValidate.prototype.checkMongo(XlreConfig.getMode(), deferred);
    XlreConfigValidate.prototype.checkGoogleDrive(XlreConfig.getMode(), deferred);
    XlreConfigValidate.prototype.checkXld(options, deferred);

    XlreConfigValidate.prototype.checkJira(XlreConfig.getMode(), deferred);

    if (deferred.promise.inspect().state !== "pending") {
        return deferred.promise;
    }

    return jiraCredentials();
};

XlreConfigValidate.prototype.checkGoogleDrive = function (mode, deferred) {
    if (mode !== "google-drive") {
        return;
    }

    if (!XlreConfig.readXlreConfig().googleDrive.clientId) {
        deferred.reject('Please specify in .xl-repo-linker-config.yml google drive clientId.');
    }

    if (!XlreConfig.readXlreConfig().googleDrive.clientSecret) {
        deferred.reject('Please specify in .xl-repo-linker-config.yml google drive clientSecret.');
    }
};

XlreConfigValidate.prototype.checkMongo = function (mode, deferred) {
    if (mode !== "google-drive") {
        return;
    }

    if (!XlreConfig.readXlreConfig().mongo.apiKey) {
        deferred.reject('Please specify in .xl-repo-linker-config.yml mongo apiKey.');
    }
};

XlreConfigValidate.prototype.checkXldLicense = function (deferred) {
    var xldLicensePath = XlreConfig.readXlreConfig().xld.license;

    if (!xldLicensePath) {
        deferred.reject('Please specify in .xl-repo-linker-config.yml the location of your XL Deploy license.');
    } else if (!fs.existsSync(xldLicensePath) || !fs.lstatSync(xldLicensePath).isFile()) {
        deferred.reject("XL License path is wrong. Please check your configuration");
    }
};

XlreConfigValidate.prototype.checkXld = function (options, deferred) {
    var conf = XlreConfig.readXlreConfig();

    if (!conf.xld.home) {
        deferred.reject('Please specify in .xl-repo-linker-config.yml the location of XLD instance.');
    } else if (!conf.xld.login && options && options.checkXldCredentials) {
        deferred.reject('Please specify in .xl-repo-linker-config.yml login to XLD.');
    } else if (!conf.xld.password && options && options.checkXldCredentials) {
        deferred.reject('Please specify in .xl-repo-linker-config.yml password to XLD.');
    }
};

XlreConfigValidate.prototype.checkJira = function (mode, deferred) {
    if (mode !== "jira") {
        return true;
    }

    var conf = XlreConfig.readXlreConfig();

    if (!conf.jira.login) {
        deferred.reject('Please specify in .xl-repo-linker-config.yml login to Jira.');
    } else if (!conf.jira.password) {
        deferred.reject('Please specify in .xl-repo-linker-config.yml password to Jira.');
    }
};

var jiraCredentials = function () {
    var deferred = Q.defer();

    if (XlreConfig.getMode() !== "jira") {
        deferred.resolve();
    } else {
        jiraPick.execute('ping', true, true).then(function (message) {
            deferred.resolve(JSON.parse(message).sections[0].issues);
        }, function (err) {
            if (err.response && err.response.statusCode === 401) {
                deferred.reject('Please check your Jira credentials');
            } else {
                deferred.reject(err);
            }
        });
    }

    return deferred.promise;
};

module.exports = new XlreConfigValidate();