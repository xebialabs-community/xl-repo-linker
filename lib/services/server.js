var app = require('../app');
var express = require('express');
var Q = require('q');

require('./../jira');
require('./../google-drive');

var packageJson = require('../../package.json');
var getport = require('getport');
var server;

var Server = function () {
};

var server_port = 3000;

Server.prototype.getServerPort = function () {
    return server_port;
};

Server.prototype.isNotStarted = function () {
    var deferred = Q.defer();
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
        server = app.listen(server_port, function () {
            var host = server.address().address;
            var port = server.address().port;
            deferred.resolve('XL Repo Linker is started at http://' + host + ':' + port);
        });

        app.get('/xlrl-version', function (req, res) {
            res.send(200, packageJson.version);
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
