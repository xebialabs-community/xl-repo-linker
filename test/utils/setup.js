var FS = require('fs-mock');
var rewire = require("rewire");

var Config = rewire('../../lib/common/config.js');

var TestSetup = function(){};

TestSetup.prototype.setupPlatform = function () {
    Config.__set__({
        process: {
            platform: 'win32',
            env: {
                'USERPROFILE': '/val',
                'HOME': 'home'
            }
        }
    });

    return Config;
};

TestSetup.prototype.setupConfigFile = function () {
    TestSetup.prototype.setupPlatform();

    var fs = new FS({
        'val': {
            '.xl-repo-linker-config.yml': 'jira:\n' +
            '  host: http://localhost:5555\n' +
            '  api_path: /rest/api/2\n' +
            '  login: Bogdan\n' +
            '  password: 12345a\n' +
            'xld:\n' +
            '  home: /home/user/xld\n' +
            '  login: admin\n' +
            '  password: 23456a\n'
        }
    });
    Config.__set__("fs", fs);

    return Config;
};

TestSetup.prototype.setupNotEncryptedConfigFile = function () {
    TestSetup.prototype.setupPlatform();

    var fs = new FS({
        'val': {
            '.xl-repo-linker-config.yml': 'jira:\n' +
            '  host: http://localhost:5555\n' +
            '  api_path: /rest/api/2\n' +
            '  login: Bogdan\n' +
            '  password: 12345a\n' +
            '  encrypted: false\n' +
            'xld:\n' +
            '  home: /home/user/xld\n' +
            '  login: admin\n' +
            '  password: 23456a\n' +
            '  encrypted: false\n'
        }
    });
    Config.__set__("fs", fs);

    return Config;
};

TestSetup.prototype.setupAlreadyEncryptedConfigFile = function () {
    TestSetup.prototype.setupPlatform();

    var fs = new FS({
        'val': {
            '.xl-repo-linker-config.yml': 'jira:\n' +
            '  host: http://localhost:5555\n' +
            '  api_path: /rest/api/2\n' +
            '  login: Bogdan\n' +
            '  password: MTIzNDVh\n' +
            '  encrypted: true\n' +
            'xld:\n' +
            '  home: /home/user/xld\n' +
            '  login: admin\n' +
            '  password: MjM0NTZh\n' +
            '  encrypted: true\n'
        }
    });
    Config.__set__("fs", fs);

    return Config;
};

module.exports = new TestSetup();