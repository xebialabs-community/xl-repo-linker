var XlreCache = require('./cache');
var Encoding = require('./encoding');

var fs = require('fs');
var jira = require('../jira');
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

XlreConfig.prototype.getRepoHome = function () {
    return XlreConfig.prototype.getUserHome() + path.sep + '.xld-repo';
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
            "    license:       # Please add here the path to your license\n" +
            "    login:         # Please add here your XLD admin user login\n" +
            "    password:      # Please add here your XLD admin user password\n" +
            "    encrypted:     false\n" +
            "local:\n" +
            "    include_plugins: true\n" +
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

XlreConfig.prototype.getLicense = function () {
    var config = XlreConfig.prototype.readXlreConfig();
    return config.xld.license;
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