var http = require('http');
var https = require('https');

var Encoding = require('./encoding');
var XlreConfig = require('./config');
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
        auth: entity.login + ':' + entity.password
    };
}

XlreHttp.prototype.createXldBasicParams = function(method, url) {
    return createBasicParams(XlreConfig.extractHttpEntity('xld'), method, url);
};

XlreHttp.prototype.createJiraBasicParams = function(method, url) {
    return createBasicParams(XlreConfig.extractHttpEntity('jira'), method, url);
};

function getClient(entity) {
    var parsedUrl = urlLib.parse(entity.host);
    return (parsedUrl.protocol === 'https:') ? https : http;
}

XlreHttp.prototype.getJiraClient = function () {
    return getClient(XlreConfig.extractHttpEntity('jira'));
};

XlreHttp.prototype.getXldClient = function () {
    return getClient(XlreConfig.extractHttpEntity('xld'));
};

XlreHttp.prototype.getDefaultPort = function () {
    var parsedUrl = urlLib.parse(XlreConfig.getKeyValue('jira.host'));
    return (parsedUrl.protocol === 'https:') ? 443 : 80;
};

module.exports = new XlreHttp();