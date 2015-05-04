var app = require('../lib/app');

var jira = require('./../lib/jira');
var XlreConfig = require('./../lib/common/config');
require('./../lib/google-drive');

var getport = require('getport');
var fs = require('fs');
var path = require('path');
var Decompress = require('decompress');
var Q = require('q');

var isInvalidConfiguration = false;

var Server = function () {
};

var server_port = 3000;

function sendResultToTheUser(res, promiseResult) {
    promiseResult.then(function (message) {
        res.send(message);
    }, function (err) {
        res.send(err);
    });
}

app.get('/import/:issue', function (req, res) {
    sendResultToTheUser(res, jira.import.execute(req.params.issue, req.query.restartServerAfterImport));
});

app.get('/export/:issue', function (req, res) {
    sendResultToTheUser(res, jira.export.execute(req.params.issue, req.query.overwriteAlreadyExported));
});

app.get('/pick', function (req, res) {
    jira.pick.execute(req.query.query, req.query.showSubTasks, req.query.showSubTaskParent).then(function (message) {
        res.send(JSON.parse(message).sections[0].issues);
    }, function (err) {
        res.send(err);
    });
});

app.get('/jiraHost', function (req, res) {
    var deferred = Q.defer();

    var jiraHost = XlreConfig.readXlreConfig().jira.host;
    var xldHome = XlreConfig.getXldLocation();
    if (XlreConfig.isValidConfigFile()) {
        isInvalidConfiguration = true;
        res.send(500, 'Please provide all values in .xl-repo-linker-config.yml in your home directory');
    } else if (!fs.existsSync(xldHome)) {
        res.send(500, 'XL Deploy home doesn\'t exist [' + xldHome + ']');
    } else {
        jiraCredentials().then(function (msg) {
            if (isInvalidConfiguration) {
                XlreConfig.encodePlainTextPasswords();
            }
            deferred.resolve(msg);
        }, function (err) {
            deferred.reject(err);
        });

        if (isInvalidConfiguration) {
            XlreConfig.encodePlainTextPasswords();
        }
    }

    deferred.promise.then(function () {
        res.send(jiraHost);
    }, function (err) {
        res.send(500, err);
    });
});

var jiraCredentials = function () {
    var deferred = Q.defer();
    jira.pick.execute('ping', true, true).then(function (message) {
        deferred.resolve(JSON.parse(message).sections[0].issues);
    }, function (err) {
        if (err.response.statusCode == 401) {
            deferred.reject('Please check your Jira credentials');
        } else {
            deferred.reject(err);
        }
    });
    return deferred.promise;
};

Server.prototype.start = function () {

    getport(server_port, function (e, p) {
        if (e || p !== server_port) {
            console.log("XL Repo Linker cannot start because port " + server_port + " is already occupied");
            return;
        }

        var server = app.listen(server_port, function () {
            var host = server.address().address;
            var port = server.address().port;

            console.log('XL Repo Linker is started at http://%s:%s', host, port)
        });
    });

};

module.exports = new Server();
