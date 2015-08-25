var XlreCache = require('./cache');
var XlreEmitter = require('./emitter');
var XlreNetwork = require('./network');

var Encoding = require('./encoding');
var path = require('path');
var _ = require('lodash-node/compat');

var XlreConfig = function () {
};

XlreConfig.prototype.getServerPort = function () {
    return 3000;
};

XlreConfig.prototype.getBaseUrl = function () {
    return 'http://' + XlreNetwork.getNetworkIp() + ':' + XlreConfig.prototype.getServerPort();
};

XlreConfig.prototype.extractHttpEntity = function (groupName) {
    var groupConf = XlreConfig.prototype.getGroupValue(groupName);

    function getVal(group, key) {
        var item = _.findWhere(group, {key: key});
        if (_.isUndefined(item)) {
            return undefined;
        }
        return item.value;
    }

    return {
        host: getVal(groupConf, 'host'),
        login: getVal(groupConf, 'login'),
        password: getVal(groupConf, 'password')
    };
};

XlreConfig.prototype.getXlreConfig = function () {
    return XlreCache.fetch('dbConf').value;
};

XlreConfig.prototype.getGroupValue = function (key) {
    var dbConf = XlreConfig.prototype.getXlreConfig();
    var tokens = key.split('.');
    var confGroup = tokens[0];
    return dbConf.groups[confGroup];
};

XlreConfig.prototype.updateModelKeyValue = function (dbConf, key, value) {
    var tokens = key.split('.');
    var confGroup = tokens[0];
    var groupItems = dbConf.groups[confGroup];
    var confKey = tokens[1];

    if (_.isUndefined(groupItems)) {
        dbConf[confGroup] = [];
        groupItems = [];
    }

    var match = _.findWhere(groupItems, {key: confKey});
    if (_.isUndefined(match)) {
        match = {};
        match.key = confKey;
        match.name = confKey;
        match.value = value;
        groupItems.push(match);
    }
    match.value = value;

    return dbConf;
};

XlreConfig.prototype.updateKeyValue = function (key, value) {
    var dbConf = XlreConfig.prototype.getXlreConfig();
    var newConf = XlreConfig.prototype.updateModelKeyValue(dbConf, key, value);

    XlreEmitter.getInstance().emit('db-conf-updated', newConf);

    return newConf;
};

XlreConfig.prototype.getKeyValue = function (key) {
    var dbConf = XlreConfig.prototype.getXlreConfig();
    var tokens = key.split('.');
    var confGroup = tokens[0];
    var confKey = tokens[1];

    var groupItems = dbConf.groups[confGroup];
    if (_.isUndefined(groupItems)) {
        return undefined;
    }

    return _.result(_.find(groupItems, {'key': confKey}), 'value');
};

XlreConfig.prototype.getRepoHome = function () {
    return XlreConfig.prototype.getUserHome() + path.sep + '.xld-repo';
};

XlreConfig.prototype.getSnapshotConfiguration = function () {
    var snapGroup = XlreConfig.prototype.getGroupValue('snapshot');

    return _.map(snapGroup, function (item) {
        var newItem = {};
        newItem[item.key] = item.value;
        return newItem;
    });
};

XlreConfig.prototype.getMongoApiKey = function () {
    return XlreConfig.prototype.getKeyValue('mongo.apiKey');
};

XlreConfig.prototype.getMode = function () {
    var mode = XlreCache.fetch('mode');
    if (mode === null) {
        return XlreConfig.prototype.getKeyValue('common.mode');
    }
    return mode;
};

XlreConfig.prototype.getLicense = function () {
    return XlreConfig.prototype.getKeyValue('xld.license');
};

XlreConfig.prototype.encodePlainTextPasswords = function () {
    var jiraPassword = XlreConfig.prototype.getKeyValue('jira.password');
    var jiraPasswordEncrypted = XlreConfig.prototype.getKeyValue('jira.encrypted');
    if (jiraPassword && jiraPasswordEncrypted === "false") {
        XlreConfig.prototype.updateKeyValue('jira.password', Encoding.encode(jiraPassword));
        XlreConfig.prototype.updateKeyValue('jira.encrypted', true);
    }

    var xldPassword = XlreConfig.prototype.getKeyValue('xld.password');
    var xldPasswordEncrypted = XlreConfig.prototype.getKeyValue('xld.encrypted');
    if (xldPassword && xldPasswordEncrypted === "false") {
        XlreConfig.prototype.updateKeyValue('xld.password', Encoding.encode(xldPassword));
        XlreConfig.prototype.updateKeyValue('xld.encrypted', true);
    }
};

XlreConfig.prototype.getUserHome = function () {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};

module.exports = new XlreConfig();