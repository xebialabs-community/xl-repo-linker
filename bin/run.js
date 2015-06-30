var cli = require('./cli');
var Files = require('../lib/common/files');
var server = require('./../lib/services/server');
var XlreCache = require('./../lib/common/cache');
var XlreConfig = require('./../lib/common/config');
var XlreSnapshot = require('./../lib/services/snapshot');

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
        .option('--show-size', 'Show the size of xld snapshot')
        .parse(process.argv);

    processOptions();
};

var processOptions = function() {
    if (!process.argv.slice(2).length) {
        program.server = true;
    }

    if (program.showSize) {
        XlreSnapshot.create().then(function(archiveZipPath) {
            console.log("XLD snapshot size is: " + Files.getSize(archiveZipPath) + " Mb");
        });
        return;
    }

    overrideDefaultValues();

    XlreConfig.checkConfig().
        then(prepareProcessCommand).
        then(processCommand).
        then(function (message) {
            console.log(message);
        }).catch(function (err) {
            console.error(err);
        });
};

var overrideDefaultValues = function () {
    if (program.xldHome) {
        XlreCache.store('xldHome', program.xldHome);
    }

    if (program.mode) {
        XlreCache.store('mode', program.mode);
    }

    if (program.server) {
        XlreCache.store('mode', 'jira');
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

var processCommand = function (data) {
    var deferred = Q.defer();

    if (program.hasOwnProperty('help')) {
        program.outputHelp();
        deferred.resolve(data);
    } else if (program.import) {
        return cli.import(program.import);
    } else if (program.importRestart) {
        return cli.import(program.importRestart, true);
    } else if (program.export) {
        return cli.export(program.export);
    } else if (program.exportOverwrite) {
        return cli.export(program.exportOverwrite, true);
    } else {
        deferred.resolve(data);
    }

    return deferred.promise;
};

module.exports = new RunApp();