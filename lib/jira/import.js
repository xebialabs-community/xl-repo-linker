var XlreSnapshot = require('../services/snapshot');
var jira = require('./api');

var XlreImport = function () {
};

XlreImport.prototype.execute = function (issue, restart) {
    return jira.downloadAttachment(issue).then(function (outcome) {
        var snapshotPath = outcome.snapshotPath;
        var archivePath = outcome.archivePath;
        return XlreSnapshot.copyToXld(issue, snapshotPath, archivePath, restart);
    });
};

module.exports = new XlreImport();