var app = require('../app');


function sendResultToTheUser(res, promiseResult) {
    promiseResult.then(function (message) {
        res.send(message);
    }, function (err) {
        res.send(500, err);
    });
}

app.get('/jira/import/:issue', function (req, res) {
    sendResultToTheUser(res, jira.import.execute(req.params.issue, req.query.restartServerAfterImport));
});

app.get('/jira/export/:issue', function (req, res) {
    sendResultToTheUser(res, jira.export.execute(req.params.issue, req.query.overwriteAlreadyExported));
});

app.get('/jira/pick', function (req, res) {
    jira.pick.execute(req.query.query, req.query.showSubTasks, req.query.showSubTaskParent).then(function (message) {
        res.send(JSON.parse(message).sections[0].issues);
    }, function (err) {
        res.send(err);
    });
});

app.get('/jira/host', function (req, res) {
    XlreConfig.checkConfig().then(function () {
        res.send(XlreConfig.readXlreConfig().jira.host);
    }, function (err) {
        res.send(500, err);
    });
});