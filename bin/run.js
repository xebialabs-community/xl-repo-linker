var cli = require('./cli');
var Files = require('../lib/common/files');
var server = require('./../lib/services/server');
var XlreCache = require('./../lib/common/cache');
var XlreDb = require('./../lib/services/db');
var XlreConfig = require('./../lib/common/config');
var XlreSnapshot = require('./../lib/services/snapshot');
var XlreXld = require('./../lib/common/xld');
var XlreConfigValidate = require('./../lib/config/validate');

var program = require('commander');
var Q = require('q');
var _ = require('lodash-node/compat');


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
        .option('--clean-gdtoken', 'Remove cached Google Drive token. Could be useful if you logged in by different user')
        .parse(process.argv);

    processOptions();
};

var processOptions = function () {
    if (!process.argv.slice(2).length) {
        program.server = true;
    }

    overrideDefaultValues();

    XlreConfigValidate.checkConfig().
        then(function () {
            return XlreXld.checkXldFolder();
        }).
        then(prepareProcessCommand).
        then(processCommand).
        then(function (message) {
            if (!_.isEmpty(message)) {
                console.log(message);
            }
        }).catch(function (err) {
            console.error(err);
        });

    if (program.showSize) {
        XlreSnapshot.create().then(function (archiveZipPath) {
            console.log("XLD snapshot size is: " + Files.getSize(archiveZipPath) + " Mb");
        });
    }
};

var overrideDefaultValues = function () {
    if (program.xldHome) {
        XlreCache.store('xldHome', program.xldHome);
    }

    if (program.mode) {
        XlreCache.store('mode', program.mode);
    }
};

var prepareProcessCommand = function () {
    var promises = [];
    var serverDefer = Q.defer();
    var cleanTokenPromise;

    if (program.cleanGdtoken) {
        cleanTokenPromise = XlreDb.remove({key: "google_drive_oauth_token"});
        promises.push(cleanTokenPromise);
    }

    if (program.server || XlreConfig.getMode() === 'google-drive') {
        promises.push(serverDefer.promise);
        server.start(true).then(function (data) {
            serverDefer.resolve(data);
        }).catch(function (err) {
            serverDefer.reject(err);
        })
    }

    return Q.all(promises);
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