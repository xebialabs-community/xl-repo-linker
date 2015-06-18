var jira = require('../lib/jira');

var Cli = function () {
};

Cli.prototype.import = function (jiraIssue, restartServerAfterImport) {
    return jira.import.execute(jiraIssue, restartServerAfterImport);
};

Cli.prototype.export = function (jiraIssue, overwriteAlreadyExported) {
    return jira.export.execute(jiraIssue, overwriteAlreadyExported);
};

module.exports = new Cli();