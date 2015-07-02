var exec = require('child_process').exec;
var fs = require('fs');
var request = require('request');
var sys = require('sys');
var Q = require('q');
var urlLib = require('url');

var XlreEncoding = require('../common/encoding');
var XlreConfig = require('../common/config');
var XlreXld = require('../common/xld');

var XlDeploy = function () {
};

XlDeploy.prototype.stopServer = function () {
    var deferred = Q.defer();

    var xlreConfig = XlreConfig.readXlreConfig();
    var parsedUrl = urlLib.parse(xlreConfig.xld.host);

    var protocol = parsedUrl.protocol;
    var host = parsedUrl.host;

    var login = xlreConfig.xld.login;
    var password = xlreConfig.xld.password;

    var options = {
        url: protocol + '//' + login + ':' + XlreEncoding.decode(password) + '@' + host + '/deployit/server/shutdown',
        method: 'POST'
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            deferred.resolve('XLD is stopped successfully');
        } else {
            deferred.reject('XLD is not stopped. ' + error);
        }
    });

    return deferred.promise;
};

XlDeploy.prototype.startServer = function (data) {
    var deferred = Q.defer();

    function puts(error, stdout, stderr) {
        sys.puts(stdout)
    }

    var xldHome = XlreXld.getHome();

    if (/^win/.test(process.platform)) {
        if (fs.existsSync(xldHome + "\\bin\\run.cmd")) {
            exec("cmd /C " + xldHome + "\\bin\\run.cmd", puts);
        } else {
            exec("cmd /C bin\\server.cmd", puts);
        }
    } else {
        if (fs.existsSync(xldHome + "/bin/run.sh")) {
            exec("sh -c " + xldHome + "/bin/run.sh", puts);
        } else {
            exec("sh -c " + xldHome + "/bin/server.sh", puts);
        }
    }

    deferred.resolve(data);

    return deferred.promise;
};

XlDeploy.prototype.restartServer = function () {
    return XlDeploy.prototype.stopServer().
     then(XlDeploy.prototype.startServer());
};

module.exports = new XlDeploy();