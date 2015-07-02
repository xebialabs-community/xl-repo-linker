var XlreConfig = require('../common/config.js');

var XlreMongo = function(){};

var mongoDb = require('mongolab-provider').init('xl-repo-linker', XlreConfig.getMongoApiKey());

XlreMongo.prototype.getMongoDb = function() {
    return mongoDb;
};

module.exports = new XlreMongo();
