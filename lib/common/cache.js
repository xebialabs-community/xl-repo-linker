var Cache = require('cache-storage');
var FileStorage = require('cache-storage/Storage/FileSyncStorage');
var temp = require('temp');
temp.track();

var tempFolder = temp.mkdirSync();
var cache = new Cache(new FileStorage(tempFolder), 'local-cache');


var XlreCache = function () {

};

XlreCache.prototype.store = function (key, value) {
    cache.save(key, value);
};

XlreCache.prototype.fetch = function (key) {
    return cache.load(key);
};

module.exports = new XlreCache();