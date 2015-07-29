var app = require('../app');
var getport = require('getport');
var Q = require('q');

require('../google-drive');
require('../jira');
require('../xlrl');

var XlreConfig = require('../common/config');

var server;

var Server = function () {
};

Server.prototype.isNotStarted = function () {
    var deferred = Q.defer();
    var server_port = XlreConfig.getServerPort();
    getport(server_port, function (e, p) {
        if (e || p !== server_port) {
            deferred.reject("XL Repo Linker cannot start because port " + server_port + " is already occupied");
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;
};

Server.prototype.start = function (logError) {
    var deferred = Q.defer();

    Server.prototype.isNotStarted(logError).then(function () {
        server = app.listen(XlreConfig.getServerPort(), function () {
            var host = server.address().address;
            var port = server.address().port;
            deferred.resolve('XL Repo Linker is started at http://' + host + ':' + port);
        });

    }, function (err) {
        deferred.reject(err);
        if (logError) {
            console.log(err);
        }
    }).catch(function (err) {
        deferred.reject(err);
    });

    return deferred.promise;
};

Server.prototype.stop = function () {
    if (server) {
        server.close();
    }
};

module.exports = new Server();
