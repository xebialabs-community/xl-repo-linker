var XlreConfig = require('../common/config');
var XlreXld = require('../common/xld');

var fs   = require('fs');
var path = require('path');
var _ = require('lodash-node/compat');

var Manifest = function(){};

Manifest.prototype.createManifestForPlugins = function(tempLocation) {
    var xldLocation = XlreXld.getHome();
    var pluginsFile = tempLocation + path.sep + '.plugins';

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    var pluginsLocation = xldLocation + path.sep + 'plugins';
    var pluginNames = '';
    _(fs.readdirSync(pluginsLocation)).forEach(function(file) {
        if (endsWith(file, '.xldp') || endsWith(file, '.jar')) {
            pluginNames += file + '\n';
        }
    }).value();

    fs.writeFileSync(pluginsFile, pluginNames);

    return pluginsFile;
};

module.exports = new Manifest();