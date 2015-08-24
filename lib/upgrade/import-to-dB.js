var Encoding = require('../common/encoding');
var XlreCache = require('../common/cache');
var XlreConfig = require('../common/config');
var XlreDb = require('../services/db');

var fs = require('fs');
var path = require('path');
var Q = require('q');
var yaml = require('js-yaml');
var _ = require('lodash-node/compat');

var XlreImportToDB = function () {
};

XlreImportToDB.prototype.run = function () {
    var deferred = Q.defer();

    XlreDb.findOne({key: 'dbConf'}).then(function (document) {
        if (!document) {
            XlreImportToDB.prototype.insertDbConfig().then(function (doc) {
                XlreCache.store('dbConf', doc);
                deferred.resolve();
            }).catch(function (err) {
                deferred.reject(err);
            });
        } else {
            XlreCache.store('dbConf', document);
            deferred.resolve();
        }
    });

    return deferred.promise;
};

XlreImportToDB.prototype.insertDbConfig = function () {

    var conf = readXlreConfig();

    var dbConf = {
        groups: {
            common: [
                {
                    order: 0,
                    key: 'mode',
                    name: 'Mode',
                    description: '',
                    type: 'enum',
                    options: ['local', 'jira', 'google-drive'],
                    value: getKeyValue(conf, 'common.mode', 'local')
                }, {
                    order: 1,
                    key: 'show_download_progress',
                    name: 'Show download progress',
                    description: '',
                    type: 'boolean',
                    value: getKeyValue(conf, 'common.show_download_progress', true)
                }
            ],
            jira: [
                {
                    order: 0,
                    key: 'host',
                    name: 'Host',
                    description: '',
                    value: getKeyValue(conf, 'jira.host', 'https://xebialabs.atlassian.net')
                }, {
                    order: 1,
                    key: 'api_path',
                    name: 'Api Path',
                    description: '',
                    value: getKeyValue(conf, 'jira.api_path', '/rest/api/2')
                }, {
                    order: 2,
                    key: 'login',
                    name: 'Login',
                    description: '',
                    value: getKeyValue(conf, 'jira.login', '')
                }, {
                    order: 3,
                    key: 'password',
                    name: 'Password',
                    description: '',
                    type: 'password',
                    value: getPassword(conf, 'jira.password', getKeyValue(conf, 'jira.encrypted', 'false'), '')
                }
            ],
            xld: [
                {
                    order: 0,
                    key: 'host',
                    name: 'Host',
                    description: '',
                    value: getKeyValue(conf, 'xld.host', 'http://localhost:4516')
                }, {
                    order: 1,
                    key: 'home',
                    name: 'Home',
                    description: '',
                    value: getKeyValue(conf, 'xld.home', '')
                }, {
                    order: 2,
                    key: 'license',
                    name: 'License',
                    description: '',
                    value: getKeyValue(conf, 'xld.license', '')
                }, {
                    order: 3,
                    key: 'login',
                    name: 'Login',
                    description: '',
                    value: getKeyValue(conf, 'xld.login', 'admin')
                }, {
                    order: 4,
                    key: 'password',
                    name: 'Password',
                    description: '',
                    type: 'password',
                    value: getPassword(conf, 'xld.password', getKeyValue(conf, 'xld.encrypted', 'false'), 'admin')
                }
            ],
            googleDrive: [
                {
                    order: 0,
                    key: 'enabled',
                    name: 'Enabled',
                    description: '',
                    type: 'boolean',
                    value: getKeyValue(conf, 'googleDrive.enabled', 'false')
                }, {
                    order: 1,
                    key: 'clientId',
                    name: 'Client Id',
                    description: '',
                    value: getKeyValue(conf, 'googleDrive.clientId', '')
                }, {
                    order: 2,
                    key: 'clientSecret',
                    name: 'Client Secret',
                    description: '',
                    value: getKeyValue(conf, 'googleDrive.clientSecret', '')
                }
            ],
            mongo: [
                {
                    order: 0,
                    key: 'apiKey',
                    name: 'Api Key',
                    description: '',
                    value: getKeyValue(conf, 'mongo.apiKey', '')
                }
            ],
            snapshot: [
                {
                    order: 0,
                    key: 'conf',
                    name: 'conf',
                    description: '',
                    value: getKeyValue(conf, 'snapshot.conf', '**/*.*,!deployit-license.lic')
                }, {
                    order: 1,
                    key: 'ext',
                    name: 'ext',
                    description: '',
                    value: getKeyValue(conf, 'snapshot.ext', '**/*.*')
                }, {
                    order: 2,
                    key: 'repository',
                    name: 'repository',
                    description: '',
                    value: getKeyValue(conf, 'snapshot.repository', '**/*.*')
                }
            ]
        }
    };

    return XlreDb.insert({key: 'dbConf', value: dbConf});
};

function getPassword(conf, fullKey, encrypted, defaultValue) {
    var value = getKeyValue(conf, fullKey, defaultValue);
    return encrypted ? Encoding.decode(value) : value;
}

function getKeyValue(conf, fullKey, defaultValue) {
    if (!_.isEmpty(conf)) {
        var keyChain = fullKey.split('.');
        return conf[keyChain[0]][keyChain[1]];
    }

    return defaultValue;
}

function getXlreConfigPath() {
    return XlreConfig.getUserHome() + path.sep + '.xl-repo-linker-config.yml';
}

function existsXlreConfig() {
    return fs.existsSync(getXlreConfigPath());
}

/* Reading xlre-config from ~/.xl-repo-linker-config.yml, to support upgrade from previous versions of XL Repo Linker */
function readXlreConfig() {
    try {
        if (!existsXlreConfig()) {
            return {};
        }
        return yaml.safeLoad(fs.readFileSync(getXlreConfigPath(), {encoding: 'utf8'}));
    } catch (e) {
        console.error(e);
        return {};
    }
}

module.exports = new XlreImportToDB();