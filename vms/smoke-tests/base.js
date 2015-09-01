var exec = require('child_process').exec;
var sleep = require('sleep');
var sys = require('sys');
var Q = require('q');
var _ = require('lodash-node/compat');

var XlreSmokeBase = function () {
};

var noop = function () {
};

var toJson = function (str) {
    return _.isEmpty(str) ? "{}" : eval("(" + str + ")");
};

var printError = function (err) {
    console.error(err.message || err);
};

var getStatusCode = function () {
    return XlreSmokeBase.prototype.executeCommand('curl -s -o /dev/null -w "%{http_code}" http://0.0.0.0:3000/xlrl/checkConfig');
};

var getMessageBody = function () {
    var deferred = Q.defer();

    exec('curl http://0.0.0.0:3000/xlrl/checkConfig', function (error, stdout) {
        deferred.resolve(toJson(stdout));
    });

    return deferred.promise;
};

XlreSmokeBase.prototype.checkCommand = function (command, callback) {
    XlreSmokeBase.prototype.executeCommand(command).then(callback);
};

XlreSmokeBase.prototype.runAndCheckCurl = function (xlreCommand, rampUpSleep, callback) {
    exec(xlreCommand, noop);
    sleep.sleep(rampUpSleep);
    getMessageBody().then(callback).catch(printError);
};

XlreSmokeBase.prototype.executeCommand = function (command) {
    var deferred = Q.defer();

    exec(command, puts);

    function puts(error, stdout, stderr) {
        if (error) {
            printError(error);
            deferred.resolve(error);
        } else if (stderr) {
            printError(stderr);
            deferred.resolve(stderr);
        } else {
            deferred.resolve(stdout);
        }
    }

    return deferred.promise;
};

module.exports = new XlreSmokeBase();