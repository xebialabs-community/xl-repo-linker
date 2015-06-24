var cli = require('./cli');
var server = require('./server');
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
        .option('--xld-home <n>', 'Override XLD home specified in configuration file')
        .parse(process.argv);

    if (!process.argv.slice(2).length) {
        program.server = true;
    }

    if (program.xldHome) {
        XlreCache.store('xldHome', program.xldHome);
    }

    XlreConfig.checkConfig().then(function () {
        processCommand();
    }).catch(function (err) {
        console.error(err);
    });
};

var processCommand = function() {

    if (program.hasOwnProperty('help')) {
        program.outputHelp();
    } else if (program.server) {
        server.start();
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

var sendResultToTheUser = function(promiseResult) {
    promiseResult.then(function (message) {
        console.log(message);
    }, function (err) {
        console.error(err);
    });
};

module.exports = new RunApp();