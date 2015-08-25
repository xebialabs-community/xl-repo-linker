var cli = require('./cli');
var Files = require('../lib/common/files');
var server = require('../lib/services/server');
var XlreCache = require('../lib/common/cache');
var XlreDb = require('../lib/services/db');
var XlreConfig = require('../lib/common/config');
var XlreSnapshot = require('../lib/services/snapshot');
var XlreConfigValidate = require('../lib/config/validate');

// register listeners
require('../lib/config/updates');

var colors = require('colors');
var open = require('open');
var program = require('commander');
var Q = require('q');
var _ = require('lodash-node/compat');


var RunApp = function () {
};

RunApp.prototype.begin = function () {

    program
        .option('-s, --server', 'Run server for Chrome Extension')
        .option('-i, --import <n>', 'Imports the data as XLD snapshot for specified JIRA issue')
        .option('-r, --import-restart <n>', 'Imports and restarts the XLD server after import')
        .option('-e, --export <n>', 'Exports XLD snapshot by specified JIRA issue')
        .option('-o, --export-overwrite <n>', 'Exports XLD snapshot and if necessary overwrites already exported archive')
        .option('--xld-home <n>', 'Override XLD home specified in the configuration file')
        .option('--mode <n>', 'Override the mode specified in the configuration file')
        .option('--show-size', 'Show the size of XLD snapshot')
        .option('--clean-gdtoken', 'Remove cached Google Drive token. Could be useful if you logged in as a different user')
        .parse(process.argv);

    processOptions();
};

var processOptions = function () {

    overrideDefaultValues();

    XlreConfigValidate.checkConfigWithPromise({
        checkXldCredentials: program.importRestart
    }, XlreConfig.getMode()).
        catch(handleConfigurationError).
        then(prepareProcessCommand).
        then(processCommand).
        then(function (message) {
            if (!_.isEmpty(message)) {
                console.log(message.green);
            }
        }).catch(function (err) {
            handleError(err);
        });

    if (program.showSize) {
        XlreSnapshot.create().then(function (archiveZipPath) {
            console.log("XLD snapshot size is: " + Files.getSize(archiveZipPath) + " Mb".gray);
            server.stop();
        });
    }
};

var isAction = function() {
    return program.import || program.importRestart || program.export || program.exportOverwrite;
};

var handleError = function (err) {
    if (typeof(err) === 'string') {
        console.error(err.red);
        if (isAction()) {
            server.stop();
        }
    }
};

var handleConfigurationError = function (err) {
    if (typeof(err) === 'object' && !_.isUndefined(err['configValidation'])) {
        console.error(err['configValidation'].red);
        server.start(true).then(function () {
            open("http://localhost:" + XlreConfig.getServerPort() + "/#/commonConfiguration");
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

    promises.push(serverDefer.promise);
    server.start(true).then(function (data) {
        serverDefer.resolve(data);
    }).catch(function (err) {
        serverDefer.reject(err);
    });

    if (program.cleanGdtoken) {
        cleanTokenPromise = XlreDb.remove({key: "google_drive_oauth_token"});
        promises.push(cleanTokenPromise);
    }

    return Q.all(promises);
};

var processCommand = function (dataArr) {
    var deferred = Q.defer();

    if (program.hasOwnProperty('help')) {
        program.outputHelp();
    }

    if (program.import) {
        return cli.import(program.import);
    } else if (program.importRestart) {
        return cli.import(program.importRestart, true);
    } else if (program.export) {
        return cli.export(program.export);
    } else if (program.exportOverwrite) {
        return cli.export(program.exportOverwrite, true);
    } else if (dataArr.length > 0) {
        deferred.resolve(dataArr[0]);
    }

    return deferred.promise;
};

module.exports = new RunApp();