var chai = require('chai');
var expect = chai.expect;
var rewire = require('rewire');

var TestSetup = require('../utils/setup.js');
var Jira = rewire('../../lib/jira/index.js');

describe('Jira index', function () {

    it('should get issue by issue name', function () {
        var Config = TestSetup.setupConfigFile();
        Config.encodePlainTextPasswords();

        var actualRequest = '';
        rp = function (val) {
            actualRequest = JSON.stringify(val);
        };

        Jira.__set__({
            XlreConfig: Config,
            rp: rp
        });

        Jira.getIssue('DEPL-1100');

        var expectedValue = '{"url":"http://Bogdan:12345a@localhost:5555/rest/api/2/issue/DEPL-1100",' +
            '"method":"GET","headers":{"Accept":"application/json"}}';

        expect(actualRequest).to.equal(expectedValue);
    });

});