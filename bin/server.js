var app = require('express')();
var services = require('./../lib/services/index');
var XlreConfig = require('./../lib/common/config.js');

var getport = require('getport');
var path = require('path');
var Decompress = require('decompress');

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
    sendResultToTheUser(res, services.import.execute(req.params.issue, req.query.restartServerAfterImport));
});

app.get('/export/:issue', function (req, res) {
    sendResultToTheUser(res, services.export.execute(req.params.issue, req.query.overwriteAlreadyExported));
});

app.get('/pick', function (req, res) {
    services.pick.execute(req.query.query, req.query.showSubTasks, req.query.showSubTaskParent).then(function (message) {
        res.send(JSON.parse(message).sections[0].issues);
    }, function (err) {
        res.send(err);
    });
});

app.get('/jiraHost', function (req, res) {
    var jiraHost = XlreConfig.readXlreConfig().jira.host;
    if (XlreConfig.isValidConfigFile()) {
        isInvalidConfiguration = true;
        res.send(500, 'Please provide all values in .xl-repo-linker-config.yml in your home directory');
    } else {
        if (isInvalidConfiguration) {
            XlreConfig.encodePlainTextPasswords();
        }
        res.send(jiraHost);
    }
});

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
