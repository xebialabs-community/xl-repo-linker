var program = require('commander');
var cli = require('./cli.js');
var server = require('./server.js');

var RunApp = function () {
};

RunApp.prototype.begin = function () {

    function sendResultToTheUser(promiseResult) {
        promiseResult.then(function (message) {
            console.log(message);
        }, function (err) {
            console.error(err);
        });
    }

    program
        .option('-s, --server', 'Run server for Chrome Extension')
        .option('-i, --import <n>', 'Imports the data as xld snapshot for specified JIRA issue')
        .option('-ir, --import-and-restart <n>', 'Imports and restarts the xld server after import')
        .option('-e, --export <n>', 'Exports xld snapshot by specified JIRA issue')
        .option('-er, --export-and-restart <n>', 'Exports xld snapshot and if necessary overwrites already exported archive')
        .parse(process.argv);

    if (!process.argv.slice(2).length) {
        program.server = true;
    }

    if (program.hasOwnProperty('help')) {
        program.outputHelp();
    } else if (program.server) {
        server.start();
    } else if (program.import) {
        sendResultToTheUser(cli.import(program.import));
    } else if (program.importAndRestart) {
        sendResultToTheUser(cli.import(program.importAndRestart, true));
    } else if (program.export) {
        sendResultToTheUser(cli.export(program.export));
    } else if (program.exportAndRestart) {
        sendResultToTheUser(cli.export(program.exportAndRestart, true));
    }

};


module.exports = new RunApp();