var XlreSnapshot = require('../services/snapshot');
var jira = require('./api');

var XlreImport = function () {
};

XlreImport.prototype.execute = function (issue, restart) {
    return jira.downloadAttachment(issue).then(function (archivePath) {
        return XlreSnapshot.copyToXld(issue, archivePath, restart);
    });
};

module.exports = new XlreImport();