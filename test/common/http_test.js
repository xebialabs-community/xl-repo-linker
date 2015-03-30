var chai = require('chai');
var expect = chai.expect;
var FS = require('fs-mock');
var rewire = require("rewire");

var TestSetup = require('../utils/setup.js');
var Http = rewire('../../lib/common/http.js');

describe("Common http", function () {

    it("should create url with basic params", function() {
        var Config = TestSetup.setupConfigFile();
        Config.encodePlainTextPasswords();

        Http.__set__({
            XlreConfig: Config
        });

        var expected = {};
        expected.host = 'localhost';
        expected.port = '5555';
        expected.method = 'POST';
        expected.path = '/xldeploy';
        expected.auth = 'Bogdan:12345a';

        expect(JSON.stringify(Http.createJiraBasicParams('POST', '/xldeploy'))).to.equal(JSON.stringify(expected));
    });

});