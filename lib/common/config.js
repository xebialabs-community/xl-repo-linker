var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var Encoding = require('./encoding.js');
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

XlreConfig.prototype.isValidConfigFile = function () {
    var conf = XlreConfig.prototype.readXlreConfig();

    var mandatoryValues = [conf.jira.login, conf.jira.password, conf.xld.home, conf.xld.login, conf.xld.password];
    var hasMissing = false;
    _(mandatoryValues).forEach(function(value){
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
            "jira:\n" +
            "    host:          https://xebialabs.atlassian.net\n" +
            "    api_path:      /rest/api/2\n" +
            "    login:         # Please add here your Jira user login\n" +
            "    password:      # Please add here your Jira user password\n" +
            "    encrypted:     false\n" +
            "xld:\n" +
            "    host: http://localhost:4516\n" +
            "    home:          # Please add here your XLD home path\n" +
            "    login:         # Please add here your XLD admin user login\n" +
            "    password:      # Please add here your XLD admin user password\n"+
            "    encrypted:     false\n" +
            "googleDrive:\n" +
            "    enabled:       false\n" +
            "    clientId:      219982597230-jt1mmsc4ajjmv583i4qkfqj6cql1hn5i.apps.googleusercontent.com # Please add here your Google Drive Client Id\n" +
            "    clientSecret:  # Please add here your Google Drive Client Secret\n";

        fs.writeFileSync(configFile, defaultConfig);
    }
};

XlreConfig.prototype.encodePlainTextPasswords = function () {
    var config = XlreConfig.prototype.readXlreConfig();

    if (config.jira.encrypted === false) {
        XlreConfig.prototype.updateKey('jira.password', Encoding.encode(config.jira.password));
    }
    XlreConfig.prototype.updateKey('jira.encrypted', true);

    if (config.xld.encrypted === false) {
        XlreConfig.prototype.updateKey('xld.password', Encoding.encode(config.xld.password));
    }
    XlreConfig.prototype.updateKey('xld.encrypted', true);
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
    return XlreConfig.prototype.readXlreConfig().xld.home;
};

function getXlreConfigFilePath() {
    return XlreConfig.prototype.getUserHome() + path.sep + '.xl-repo-linker-config.yml';
}

function updateObjectProperty(config, key, value) {
    var index = key.indexOf('.');
    if (index != -1) {
        updateObjectProperty(config[key.substring(0, index)], key.substring(index + 1), value);
    } else {
        config[key] = value;
    }
}

module.exports = new XlreConfig();