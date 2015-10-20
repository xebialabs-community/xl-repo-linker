var XlreCache = require('../common/cache');
var XlreDb = require('../services/db');
var XlreEmitter = require('../common/emitter');

XlreEmitter.getInstance().on('db-conf-updated', function (pageConfig) {
    XlreDb.update('dbConf', {key: "dbConf", value: pageConfig});
    XlreCache.store('dbConf', {value: pageConfig});
});
