var cli = require('./cli');
var server = require('./../lib/services/server');
var XlreConfig = require('./../lib/common/config');
var XlreCache = require('./../lib/common/cache');

var program = require('commander');
var Q = require('q');


var RunApp = function () {
};

RunApp.prototype.begin = function () {

    program
        .option('-s, --server', 'Run server for Chrome Extension')
        .option('-i, --import <n>', 'Imports the data as xld snapshot for specified JIRA issue')
        .option('-r, --import-restart <n>', 'Imports and restarts the xld server after import')
        .option('-e, --export <n>', 'Exports xld snapshot by specified JIRA issue')
        .option('-o, --export-overwrite <n>', 'Exports xld snapshot and if necessary overwrites already exported archive')
        .option('--xld-home <n>', 'Override XLD home specified in the configuration file')
        .option('--mode <n>', 'Override the mode specified in the configuration file')
        .parse(process.argv);

    if (!process.argv.slice(2).length) {
        program.server = true;
    }

    overrideDefaultValues();

    XlreConfig.checkConfig().then(prepareProcessCommand).then(processCommand).catch(function (err) {
        console.error(err);
    });
};

var overrideDefaultValues = function() {
    if (program.xldHome) {
        XlreCache.store('xldHome', program.xldHome);
    }

    if (program.mode) {
        XlreCache.store('mode', program.mode);
    }
};

var prepareProcessCommand = function () {
    var deferred = Q.defer();

    if (program.server || XlreConfig.getMode() === 'google-drive') {
        server.start(true).then(function (data) {
            deferred.resolve(data);
        }).catch(function (err) {
            deferred.reject(err);
        })
    } else {
        deferred.resolve();
    }

    return deferred.promise;
};

var processCommand = function () {

    if (program.hasOwnProperty('help')) {
        program.outputHelp();
    } else if (program.import) {
        sendResultToTheUser(cli.import(program.import));
    } else if (program.importRestart) {
        sendResultToTheUser(cli.import(program.importRestart, true));
    } else if (program.export) {
        sendResultToTheUser(cli.export(program.export));
    } else if (program.exportOverwrite) {
        sendResultToTheUser(cli.export(program.exportOverwrite, true));
    }
};

var sendResultToTheUser = function (promiseResult) {
    promiseResult.then(function (message) {
        console.log(message);
    }, function (err) {
        console.error(err);
    });
};

module.exports = new RunApp();