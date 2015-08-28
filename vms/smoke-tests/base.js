var exec = require('child_process').exec;
var sys = require('sys');
var Q = require('q');

var XlreSmokeBase = function () {
};

XlreSmokeBase.prototype.executeCommand = function (command) {
    var deferred = Q.defer();

    exec(command, puts);

    function puts(error, stdout, stderr) {
        if (error) {
            deferred.reject(error);
        } else if (stderr) {
            deferred.reject(stderr);
        } else {
            deferred.resolve(stdout);
        }
    }

    return deferred.promise;
};

module.exports = new XlreSmokeBase();