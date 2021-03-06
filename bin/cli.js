var jira = require('../lib/jira');
var googleDrive = require('../lib/google-drive');
var local = require('../lib/local');

var XlreConfig = require('./../lib/common/config');

var Cli = function () {
};

var getProvider = function () {
    if (XlreConfig.getMode() === "jira") {
        return jira;
    } else if (XlreConfig.getMode() === "google-drive") {
        return googleDrive;
    }

    return local;
};

Cli.prototype.import = function (name, restartServerAfterImport) {
    var restart = restartServerAfterImport ? restartServerAfterImport.toString() : "false";
    return getProvider().import.execute(name, restart, true);
};

Cli.prototype.export = function (name, overwriteAlreadyExported) {
    var force = overwriteAlreadyExported ? overwriteAlreadyExported.toString() : "false";
    return getProvider().export.execute(name, force, true);
};

module.exports = new Cli();