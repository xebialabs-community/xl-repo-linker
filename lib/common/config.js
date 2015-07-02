var XlreCache = require('./cache');
var Encoding = require('./encoding');

var fs = require('fs');
var jira = require('./../jira');
var path = require('path');
var Q = require('q');
var yaml = require('js-yaml');
var _ = require('lodash-node/compat');

var XlreConfig = function () {
};

XlreConfig.prototype.readXlreConfig = function () {
    try {
        return yaml.safeLoad(fs.readFileSync(getXlreConfigFilePath(), {encoding: 'utf8'}));
    } catch (e) {
        console.error(e);
        return {};
    }
};

XlreConfig.prototype.getRepoHome = function() {
    return XlreConfig.prototype.getUserHome() + path.sep + '.xld-repo';
};

XlreConfig.prototype.isValidConfigFile = function () {
    var conf = XlreConfig.prototype.readXlreConfig();

    var mandatoryValues = [conf.xld.home, conf.xld.login, conf.xld.password];

    if (XlreConfig.prototype.getMode() === "jira") {
        mandatoryValues.push.apply(mandatoryValues, [conf.jira.login, conf.jira.password]);
    }

    var hasMissing = false;
    _(mandatoryValues).forEach(function (value) {
        if (!value) {
            hasMissing = true;
        }
    }).value();

    return hasMissing;
};

XlreConfig.prototype.createDefaultConfigFile = function () {
    var configFile = getXlreConfigFilePath();
    if (!fs.existsSync(configFile)) {
        var defaultConfig =
            "common:\n" +
            "    mode:          local\n" +
            "jira:\n" +
            "    host:          https://xebialabs.atlassian.net\n" +
            "    api_path:      /rest/api/2\n" +
            "    login:         # Please add here your Jira user login\n" +
            "    password:      # Please add here your Jira user password\n" +
            "    encrypted:     false\n" +
            "xld:\n" +
            "    host:          http://localhost:4516\n" +
            "    home:          # Please add here your XLD home path\n" +
            "    login:         # Please add here your XLD admin user login\n" +
            "    password:      # Please add here your XLD admin user password\n" +
            "    encrypted:     false\n" +
            "googleDrive:\n" +
            "    enabled:       false\n" +
            "    clientId:      219982597230-jt1mmsc4ajjmv583i4qkfqj6cql1hn5i.apps.googleusercontent.com\n" +
            "    clientSecret:  # Please add here your Google Drive Client Secret\n" +
            "mongo:\n" +
            "    apiKey:        # Please add here your MongoLab API Key";

        fs.writeFileSync(configFile, defaultConfig);
    }
};

XlreConfig.prototype.getMongoApiKey = function () {
    var config = XlreConfig.prototype.readXlreConfig();
    if (config.mongo) {
        return config.mongo.apiKey;
    }
    return undefined;
};

XlreConfig.prototype.getMode = function () {
    var mode = XlreCache.fetch('mode');
    if (mode === null) {
        return XlreConfig.prototype.readXlreConfig().common.mode;
    }
    return mode;
};

XlreConfig.prototype.encodePlainTextPasswords = function () {
    var config = XlreConfig.prototype.readXlreConfig();

    if (config.jira.password) {
        if (config.jira.encrypted === false) {
            XlreConfig.prototype.updateKey('jira.password', Encoding.encode(config.jira.password));
        }
        XlreConfig.prototype.updateKey('jira.encrypted', true);
    }

    if (config.xld.password) {
        if (config.xld.encrypted === false) {
            XlreConfig.prototype.updateKey('xld.password', Encoding.encode(config.xld.password));
        }
        XlreConfig.prototype.updateKey('xld.encrypted', true);
    }
};

XlreConfig.prototype.updateKey = function (key, value) {
    var config = XlreConfig.prototype.readXlreConfig();
    updateObjectProperty(config, key, value);
    XlreConfig.prototype.writeXlreConfig(config);
};

XlreConfig.prototype.writeXlreConfig = function (newConfig) {
    fs.writeFileSync(getXlreConfigFilePath(), yaml.dump(newConfig));
};

XlreConfig.prototype.getUserHome = function () {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};

XlreConfig.prototype.getXldLocation = function () {
    var xldHome = XlreCache.fetch('xldHome');

    if (xldHome === null) {
        return XlreConfig.prototype.readXlreConfig().xld.home;
    }

    return xldHome;
};

XlreConfig.prototype.checkConfig = function () {
    var deferred = Q.defer();
    var config = XlreConfig.prototype.readXlreConfig();

    if (XlreConfig.prototype.isValidConfigFile()) {
        deferred.reject('Please provide all values in .xl-repo-linker-config.yml in your home directory');
        return deferred.promise;
    }

    return checkXldFolder().then(jiraCredentials());
};

var checkXldFolder = function () {
    var deferred = Q.defer();

    var xldHome = XlreConfig.prototype.getXldLocation();

    if (!fs.existsSync(xldHome)) {
        deferred.reject('XL Deploy home doesn\'t exist [' + xldHome + ']');
    }

    var foldersToCheck = ['conf', 'ext', 'plugins'];

    _(foldersToCheck).forEach(function (folderToCheck) {
        if (!fs.existsSync(xldHome + path.sep + folderToCheck)) {
            deferred.reject('You pointed to a wrong folder for XLD');
        }
    }).value();

    deferred.resolve();

    return deferred.promise;
};

var jiraCredentials = function () {
    var deferred = Q.defer();

    if (XlreConfig.prototype.getMode() !== "jira") {
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

function getXlreConfigFilePath() {
    return XlreConfig.prototype.getUserHome() + path.sep + '.xl-repo-linker-config.yml';
}

function updateObjectProperty(config, key, value) {
    var index = key.indexOf('.');
    if (index != -1) {
        var subKey = key.substring(0, index);
        var subConfig = config[subKey];
        if (!subConfig) {
            config[subKey] = {};
        }
        updateObjectProperty(config[subKey], key.substring(index + 1), value);
    } else {
        config[key] = value;
    }
}

module.exports = new XlreConfig();