var http = require('http');
var https = require('https');

var Encoding = require('./encoding.js');
var XlreConfig = require('./config.js');
var urlLib = require('url');

var XlreHttp = function () {
};

function createBasicParams(entity, method, url) {
    var parsedUrl = urlLib.parse(entity.host);

    return {
        host: parsedUrl.hostname,
        port: parsedUrl.port || XlreHttp.prototype.getDefaultPort(),
        method: method,
        path: url,
        auth: entity.login + ':' + Encoding.decode(entity.password)
    };
}

XlreHttp.prototype.createXldBasicParams = function(method, url) {
    var xlreOptions = XlreConfig.readXlreConfig();
    return createBasicParams(xlreOptions.xld, method, url);
};

XlreHttp.prototype.createJiraBasicParams = function(method, url) {
    var xlreOptions = XlreConfig.readXlreConfig();
    return createBasicParams(xlreOptions.jira, method, url);
};

function getClient(entity) {
    var parsedUrl = urlLib.parse(entity.host);
    return (parsedUrl.protocol === 'https:') ? https : http;
}

XlreHttp.prototype.getJiraClient = function () {
    return getClient(XlreConfig.readXlreConfig().jira);
};

XlreHttp.prototype.getXldClient = function () {
    return getClient(XlreConfig.readXlreConfig().xld);
};

XlreHttp.prototype.getDefaultPort = function () {
    var xlreOptions = XlreConfig.readXlreConfig();
    var parsedUrl = urlLib.parse(xlreOptions.jira.host);

    return (parsedUrl.protocol === 'https:') ? 443 : 80;
};

module.exports = new XlreHttp();