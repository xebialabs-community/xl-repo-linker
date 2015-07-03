var jira = require('../jira');
var XlreConfig = require('../common/config');

var fs = require('fs');
var Q = require('q');
var _ = require('lodash-node/compat');

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var XlreConfigValidate = function () {
};

XlreConfigValidate.prototype.checkConfig = function () {
    var deferred = Q.defer();

    XlreConfigValidate.prototype.checkXldLicense(deferred);
    XlreConfigValidate.prototype.checkMongo(deferred);
    XlreConfigValidate.prototype.checkGoogleDrive(deferred);

    if (deferred.promise.inspect().state !== "pending") {
        return deferred.promise;
    }

    if (!XlreConfigValidate.prototype.isValidConfigFile()) {
        deferred.reject('Please provide all values in .xl-repo-linker-config.yml in your home directory');
        return deferred.promise;
    }

    return jiraCredentials();
};

XlreConfigValidate.prototype.checkGoogleDrive = function (deferred) {
    if (XlreConfig.getMode() !== "google-drive") {
        return;
    }

    if (!XlreConfig.readXlreConfig().googleDrive.clientId) {
        deferred.reject('Please specify in .xl-repo-linker-config.yml google drive clientId.');
    }

    if (!XlreConfig.readXlreConfig().googleDrive.clientSecret) {
        deferred.reject('Please specify in .xl-repo-linker-config.yml google drive clientSecret.');
    }
};

XlreConfigValidate.prototype.checkMongo = function (deferred) {
    if (XlreConfig.getMode() !== "google-drive") {
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

XlreConfigValidate.prototype.isValidConfigFile = function () {
    if (XlreConfig.getMode() !== "jira") {
        return true;
    }

    var conf = XlreConfig.readXlreConfig();

    var mandatoryValues = [conf.xld.home, conf.xld.login, conf.xld.password];

    if (XlreConfig.getMode() === "jira") {
        mandatoryValues.push.apply(mandatoryValues, [conf.jira.login, conf.jira.password]);
    }

    var hasMissing = false;
    _(mandatoryValues).forEach(function (value) {
        if (!value) {
            hasMissing = true;
        }
    }).value();

    return !hasMissing;
};

var jiraCredentials = function () {
    var deferred = Q.defer();

    if (XlreConfig.getMode() !== "jira") {
        deferred.resolve();
    } else {
        jira.pick.execute('ping', true, true).then(function (message) {
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