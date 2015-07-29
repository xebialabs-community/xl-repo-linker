var XlreCache = require('../common/cache');
var XlreConfig = require('../common/config');
var XlreDb = require('../services/db');
var XlreEmitter = require('../common/emitter');

var _ = require('lodash-node/compat');


XlreEmitter.getInstance().on('db-conf-updated', function (pageConfig) {
    XlreDb.update('dbConf', {key: "dbConf", value: pageConfig});
    XlreCache.store('dbConf', {value: pageConfig});
});
