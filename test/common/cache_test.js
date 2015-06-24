var assert = require('assert');
var Cache = require('../../lib/common/cache.js');
var _ = require('lodash-node/compat');

describe("Cache", function () {

    it("should cache values", function () {
        Cache.store("key1", "value1");
        assert.equal(Cache.fetch("key1"), "value1");
    });

    it("should return undefined if no values in cache", function () {
        assert.equal(Cache.fetch("someKey1"), null);
    });
});