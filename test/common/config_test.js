var chai = require('chai');
var expect = chai.expect;
var TestSetup = require('../utils/setup.js');

describe("Common config", function () {

    it ("should replace config", function() {
        var Config = TestSetup.setupConfigFile();

        var res = {};
        res.jira = {};
        res.jira.host = 'localhost:5555';

        Config.writeXlreConfig(res);
        expect(JSON.stringify(Config.readXlreConfig())).to.equal(JSON.stringify(res));
    });

    it("should return xld home location", function () {
        var Config = TestSetup.setupConfigFile();
        expect(Config.getXldLocation()).to.equal('/home/user/xld');
    });

    it("should update config key", function () {
        var Config = TestSetup.setupConfigFile();

        Config.updateKey('jira.host', 'localhost:5557');
        expect(Config.readXlreConfig().jira.host).to.equal('localhost:5557');
    });

    it("should encode plain text password in configuration file", function () {
        var Config = TestSetup.setupConfigFile();
        Config.encodePlainTextPasswords();
        var config = Config.readXlreConfig();
        expect(config.jira.password).to.equal('12345a');
        expect(config.xld.password).to.equal('23456a');
    });

    it("should encode plain text password in configuration file with not encrypted values", function () {
        var Config = TestSetup.setupNotEncryptedConfigFile();

        Config.encodePlainTextPasswords();
        var config = Config.readXlreConfig();
        expect(config.jira.password).to.equal('MTIzNDVh');
        expect(config.xld.password).to.equal('MjM0NTZh');
    });

    it("should encode plain text password in configuration file", function () {
        var Config = TestSetup.setupAlreadyEncryptedConfigFile();

        Config.encodePlainTextPasswords();
        config2 = Config.readXlreConfig();
        expect(config2.jira.password).to.equal('MTIzNDVh');
        expect(config2.xld.password).to.equal('MjM0NTZh');
    });

    it("should read config file", function () {
        var Config = TestSetup.setupConfigFile();

        var res = {};
        res.jira = {};
        res.jira.host = 'http://localhost:5555';
        res.jira.api_path = '/rest/api/2';
        res.jira.login = 'Bogdan';
        res.jira.password = '12345a';
        res.xld = {};
        res.xld.home = '/home/user/xld';
        res.xld.login = 'admin';
        res.xld.password = '23456a';

        expect(JSON.stringify(Config.readXlreConfig())).to.equal(JSON.stringify(res));
    });

    it("should return xl-repo-linker home", function () {
        var Config = TestSetup.setupPlatform();

        expect(Config.getUserHome()).to.equal('/val');

        Config.__set__({
            process: {
                platform: 'not-win32',
                env: {
                    'USERPROFILE': '/val',
                    'HOME': '/home'
                }
            }
        });

        expect(Config.getUserHome()).to.equal('/home');
    });


});
