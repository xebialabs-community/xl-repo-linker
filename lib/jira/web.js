var app = require('../app');
var imp = require('./import');
var exp = require('./export');
var pick = require('./pick');

var XlreConfig = require('../common/config');
var XlreXld = require('../common/xld');

function sendResultToTheUser(res, promiseResult) {
    promiseResult.then(function (message) {
        res.send(message);
    }, function (err) {
        res.send(500, err);
    });
}

app.get('/jira/import/:issue', function (req, res) {
    sendResultToTheUser(res, imp.execute(req.params.issue, req.query.restartServerAfterImport));
});

app.get('/jira/export/:issue', function (req, res) {
    sendResultToTheUser(res, exp.execute(req.params.issue, req.query.overwriteAlreadyExported));
});

app.get('/jira/pick', function (req, res) {
    pick.execute(req.query.query, req.query.showSubTasks, req.query.showSubTaskParent).then(function (message) {
        res.send(JSON.parse(message).sections[0].issues);
    }, function (err) {
        res.send(err);
    });
});

app.get('/jira/host', function (req, res) {
    XlreConfig.checkConfig().then(function() {
        return XlreXld.checkXldFolder();
    }).then(function () {
        res.send(XlreConfig.readXlreConfig().jira.host);
    }, function (err) {
        res.send(500, err);
    });
});