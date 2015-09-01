var cli = require('./cli');
var Files = require('../lib/common/files');
var server = require('../lib/services/server');
var XlreCache = require('../lib/common/cache');
var XlreDb = require('../lib/services/db');
var XlreConfig = require('../lib/common/config');
var XlreInit = require('../lib/common/init');
var XlreLogger = require('../lib/common/logger');
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

    enableLogging();

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

    checkMode().
        then(initValues).
        then(checkConfigs).
        then(prepareProcessCommand).
        then(processCommand).
        then(processSuccessfulFlow).
        then(showSize).
        catch(handleError);
};

var initValues = function () {
    return XlreInit.initValues();
};

var checkMode = function () {
    return Q.Promise(function (resolve, reject) {
        if (!_.contains(['local', 'jira', 'google-drive'], XlreConfig.getMode())) {
            reject('Please check your mode value, valid values are [local, jira, google-drive]');
        } else {
            resolve();
        }
    });
};

var showSize = function () {
    return Q.Promise(function (resolve) {
        if (program.showSize) {
            XlreSnapshot.create().then(function (archiveZipPath) {
                XlreLogger.info("XLD snapshot size is: " + Files.getSize(archiveZipPath) + " Mb");
                server.stop();
            });
        }
        resolve.resolve();
    });
};

var checkConfigs = function () {
    return XlreConfigValidate.checkConfigWithPromise({
        checkXldCredentials: program.importRestart,
        checkXldLicense: program.export || program.exportOverwrite
    }, XlreConfig.getMode());
};

var processSuccessfulFlow = function (message) {
    if (!_.isEmpty(message)) {
        XlreLogger.info(message);
    }

    if (isAction()) {
        server.stop();
    }
};


var isAction = function () {
    return program.import || program.importRestart || program.export || program.exportOverwrite;
};

var handleError = function (err) {
    handleConfigurationError(err);

    if (typeof(err) === 'string') {
        XlreLogger.error(err);
        if (isAction()) {
            server.stop();
        }
    } else if (Array.isArray(err)) {
        _.map(err, function (errItem) {
            XlreLogger.error(errItem.toString());
        })
    }
};

var handleConfigurationError = function (err) {
    if (typeof(err) === 'object' && !_.isUndefined(err['configValidation'])) {
        XlreLogger.error(err['configValidation']);
        server.start(true).then(function () {
            open(XlreConfig.getBaseUrl() + "/#/commonConfiguration");
        }).catch(function (err) {
            XlreLogger.error(err);
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

var isConsoleMode = function () {
    return isAction() || program.showSize;
};

var enableLogging = function () {
    XlreLogger.listen('INFO', function (msgObj) {
        XlreLogger.logToConsole(msgObj)
    });
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