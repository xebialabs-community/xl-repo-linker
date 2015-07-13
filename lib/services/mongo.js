var XlreConfig = require('../common/config.js');

var XlreMongo = function(){};

var mongoDb;

XlreMongo.prototype.getMongoDb = function() {

    if (!mongoDb) {
        mongoDb = require('mongolab-provider').init('xl-repo-linker', XlreConfig.getMongoApiKey());
    }

    return mongoDb;
};

module.exports = new XlreMongo();
