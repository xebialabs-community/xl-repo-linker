var chai = require('chai');
var expect = chai.expect;
var FS = require('fs-mock');
var rewire = require('rewire');

var TestSetup = require('../utils/setup');
var Manifest = rewire('../../lib/services/manifest');
var XlreXld = rewire('../../lib/common/xld');

describe('Services manifest', function () {

    it('should create .plugin with the list of .xldp and .jar files', function () {

        var Config = TestSetup.setupConfigFile();
        Config.encodePlainTextPasswords();

        var fs = new FS({
            '/home/user/xld/plugins': {
                '1.jar': '',
                '2.jar': '',
                '3.xldp': '',
                '4.txt': '',
                '5.lic': ''
            }
        });

        var pluginsData = '';
        var pluginsFilePath = '';
        fs.writeFileSync = function(filename, data) {
            pluginsData = data;
            pluginsFilePath = filename;
        };

        XlreXld.__set__({
            XlreConfig: Config
        });

        Manifest.__set__({
            XlreConfig: Config,
            XlreXld: XlreXld,
            fs: fs
        });

        Manifest.createManifestForPlugins('/temp');

        expect(pluginsData).to.equal('1.jar\n2.jar\n3.xldp\n');
        expect(pluginsFilePath).to.equal('/temp/.plugins');
    });

});