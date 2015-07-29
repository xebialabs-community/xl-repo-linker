var XlreConfig = require('../common/config');
var XlreXld = require('../common/xld');

var Decompress = require('decompress');
var fs = require('fs');
var globule = require('globule');
var path = require('path');
var Q = require('q');
var _ = require('lodash-node/compat');

var temp = require('temp');
temp.track();

var XlreManifest = function () {
};

XlreManifest.prototype.createManifestForPlugins = function (tempLocation) {
    var xldLocation = XlreXld.getHome();
    var pluginsFile = tempLocation + path.sep + '.plugins';

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    var pluginsLocation = xldLocation + path.sep + 'plugins';
    var pluginNames = '';
    _(fs.readdirSync(pluginsLocation)).forEach(function (file) {
        if (endsWith(file, '.xldp') || endsWith(file, '.jar')) {
            pluginNames += file + '\n';
        }
    }).value();

    fs.writeFileSync(pluginsFile, pluginNames);

    return pluginsFile;
};

XlreManifest.prototype.createManifestForXLD = function (tempLocation) {
    var deferred = Q.defer();

    var xldLocation = '/Users/bogdannechyporenko/proj/xl-deploy/package/build/distributions/xl-deploy-4.5.5-SNAPSHOT-server';
    var xldManifestFile = tempLocation + path.sep + '.xld-version';
    var libsLocation = xldLocation + path.sep + 'lib';

    var foundLibs = globule.find(libsLocation + '/server-[0-9]**.jar');

    if (foundLibs.length < 1) {
        deferred.reject('Cannot find server lib JAR to identify XLD version');
    } else if (foundLibs.length > 1) {
        deferred.reject('Found several server lib JARs, cannot identify XLD version');
    } else {
        var serverLibPath = foundLibs[0];
        extractXLDVersion(serverLibPath, tempLocation).then(function (data) {
            fs.writeFileSync(xldManifestFile, data);
            deferred.resolve(xldManifestFile);
        }).catch(function (err) {
            deferred.reject(err);
        });
    }

    return deferred.promise;
};

function extractXLDVersion(serverLibPath, tempLocation) {
    var deferred = Q.defer();

    var decompress = new Decompress({mode: '755'})
        .src(serverLibPath)
        .dest(tempLocation)
        .use(Decompress.zip());

    var tmpLoc = tempLocation + '/web/';

    decompress.run(function (err) {
        if (err) {
            deferred.reject(err);
        } else {
            var foundings = globule.find(tmpLoc + '*.swf');
            if (foundings.length == 0) {
                deferred.reject('SWF file in server lib has not been found');
            } else {
                var swfName = path.basename(foundings[0]);

                var startIndex = swfName.indexOf('-') + '-'.length;
                var endIndex = swfName.indexOf('.swf');

                deferred.resolve(swfName.substring(startIndex, endIndex));
            }
        }
    });

    return deferred.promise;
}

module.exports = new XlreManifest();