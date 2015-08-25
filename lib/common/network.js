var XlreCache = require('./cache');

var XlreNetwork = function () {
};

XlreNetwork.prototype.getNetworkIp = function () {
    return XlreCache.fetch('xlre-ip');
};

XlreNetwork.prototype.findNetworkIp = (function () {
    var ignoreRE = /^(127\.0\.0\.1|::1|fe80(:1)?::1(%.*)?)$/i;

    var exec = require('child_process').exec;
    var cached;
    var command;
    var filterRE;

    switch (process.platform) {
        case 'darwin':
            command = 'ifconfig';
            filterRE = /\binet\s+([^\s]+)/g;
            // filterRE = /\binet6\s+([^\s]+)/g; // IPv6
            break;
        default:
            command = 'ifconfig';
            filterRE = /\binet\b[^:]+:\s*([^\s]+)/g;
            // filterRE = /\binet6[^:]+:\s*([^\s]+)/g; // IPv6
            break;
    }

    return function (callback, bypassCache) {
        // get cached value
        if (cached && !bypassCache) {
            callback(null, cached);
            return;
        }
        // system call
        exec(command, function (error, stdout, sterr) {
            var ips = [];
            // extract IPs
            var matches = stdout.match(filterRE);
            // JS has no lookbehind REs, so we need a trick
            for (var i = 0; i < matches.length; i++) {
                ips.push(matches[i].replace(filterRE, '$1'));
            }

            // filter BS
            for (var j = 0, l = ips.length; j < l; j++) {
                if (!ignoreRE.test(ips[j])) {
                    //if (!error) {
                    cached = ips[j];
                    //}
                    callback(error, ips[j]);
                    return;
                }
            }
            // nothing found
            callback(error, null);
        });
    };
})();

module.exports = new XlreNetwork();