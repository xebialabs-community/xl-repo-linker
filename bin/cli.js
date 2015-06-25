var jira = require('../lib/jira');
var local = require('../lib/local');

var XlreConfig = require('./../lib/common/config');

var Cli = function () {
};

var getProvider = function() {
    if (XlreConfig.getMode() === "jira") {
        return jira;
    }

    return local;
};

Cli.prototype.import = function (jiraIssue, restartServerAfterImport) {
    return getProvider().import.execute(jiraIssue, restartServerAfterImport);
};

Cli.prototype.export = function (jiraIssue, overwriteAlreadyExported) {
    return getProvider().export.execute(jiraIssue, overwriteAlreadyExported);
};

module.exports = new Cli();