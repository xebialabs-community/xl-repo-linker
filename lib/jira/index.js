var http = require('http');
var https = require('https');
var fs = require('fs');
var rp = require('request-promise');
var app = require('express')();
var mime = require('mime');
var path = require('path');
var async = require('async');
var request = require('request');
var Q = require('q');
var urlLib = require('url');
var _ = require('lodash-node/compat');

var XlreHttp = require('../common/http.js');
var XlreConfig = require('../common/config.js');
var Encoding = require('../common/encoding.js');

var headers = {
    'Accept': 'application/json'
};

exports.getIssue = function (issue) {

    var rpOptions = {
        url: exports.getBaseUrl() + '/issue/' + issue,
        method: 'GET',
        headers: headers
    };

    return rp(rpOptions);
};

exports.getAttachment = function (attachmentId) {
    var rpOptions = {
        url: exports.getBaseUrl() + '/attachment/' + attachmentId,
        method: 'GET',
        headers: headers
    };

    return rp(rpOptions);
};

exports.deleteAttachment = function (xldAttachmentId) {
    var rpOptions = {
        url: exports.getBaseUrl() + '/attachment/' + xldAttachmentId,
        method: 'DELETE',
        headers: headers
    };

    return rp(rpOptions);
};

exports.findXldAttachmentId = function (issueData) {
    var attachmentId = undefined;
    _.each(JSON.parse(issueData).fields.attachment, function (attachment) {
        if (attachment.filename == "xld-snapshot.zip") {
            attachmentId = attachment.id;
        }
    });

    return attachmentId;
};

exports.uploadAttachment = function (zipFilePath, issue, force) {

    var deferred = Q.defer();

    var xlreOptions = XlreConfig.readXlreConfig();

    exports.getIssue(issue).then(function (issueData) {
        var xldAttachmentId = exports.findXldAttachmentId(issueData);

        if (!xldAttachmentId || xldAttachmentId && force) {
            var options = {
                config: {
                    "username": xlreOptions.jira.login,
                    "password": Encoding.decode(xlreOptions.jira.password),
                    "host": xlreOptions.jira.host,
                    "path": xlreOptions.jira.api_path
                },
                data: {
                    fields: {
                        issue: {
                            key: issue
                        }
                    },
                    file: zipFilePath
                }
            };

            function postAttachment() {
                exports.post(options, function (err, response) {
                    if (err) {
                        console.error(err);
                    } else {
                        deferred.resolve('Attachment for issue ' + issue + ' has been successfully uploaded');
                    }
                });
            }

            if (xldAttachmentId) {
                exports.deleteAttachment(xldAttachmentId).then(function () {
                    postAttachment();
                });
            } else {
                postAttachment();
            }

        } else {
            deferred.reject('Issue ' + issue + ' has xld attachment already');
        }
    }, function (error) {
        deferred.reject(error);
    });

    return deferred.promise;
};

exports.findXldAttachmentId = function (issueData) {
    var foundAttachment = undefined;
    _.each(JSON.parse(issueData).fields.attachment, function (attachment) {
        if (attachment.filename == "xld-snapshot.zip") {
            foundAttachment = attachment;
        }
    });

    return foundAttachment;
};

exports.downloadAttachment = function (issue) {

    var deferred = Q.defer();

    exports.getIssue(issue).then(function (issueData) {
        var xlreOptions = XlreConfig.readXlreConfig();
        var xldHome = xlreOptions.xld.home;

        var attachment = exports.findXldAttachmentId(issueData);
        var attachmentName = attachment.filename;
        var attachmentUrl = attachment.content;

        var params = XlreHttp.createJiraBasicParams("GET", urlLib.parse(attachmentUrl).path);

        XlreHttp.getJiraClient().get(params, function (response) {

            if (response.statusCode === 200) {
                var file = fs.createWriteStream(xldHome + path.sep + attachmentName);
                response.pipe(file);
                file.on('finish', function () {
                    deferred.resolve("File " + attachmentName + " has been successfully downloaded");
                });
                file.on('error', function (err) {
                    deferred.resolve("File " + attachmentName + " hasn't been downloaded. " + err);
                });
            } else {
                deferred.reject("Status code: " + response.statusCode + ". File " + attachmentName + "hasn't been downloaded.");
            }
        });
    }, function (error) {
        deferred.reject('Trying to get information about issue is failed. ' + error);
    });

    return deferred.promise;
};

exports.post = function (options, callback) {
    var boundary = '----------------------------' + Date.now(),
        payload = {
            head: '',
            data: '',
            tail: '',
            length: 0
        };

    /*
     * Write the payload for the request
     */
    function setPayload(callback) {
        if (options.data.file) {
            async.waterfall([
                    // Head
                    function (callback) {
                        payload.head = new Buffer('--' + boundary + '\r\n' +
                        'Content-Disposition: form-data; name="file"; filename="' + path.basename(options.data.file) + '"\r\n' +
                        'Content-Type: ' + mime.lookup(options.data.file) + '\r\n' +
                        '\r\n');
                        callback(null);
                    },
                    // Body
                    function (callback) {
                        fs.readFile(options.data.file, function (err, data) {
                            payload.data = data;
                            callback(null);
                        });
                    },
                    // Tail
                    function (callback) {
                        payload.tail = new Buffer('\r\n--' + boundary + '--\r\n\r\n');
                        callback(null);
                    },
                    // Length
                    function (callback) {
                        payload.length = payload.head.length + payload.data.length + payload.tail.length;
                        callback(null);
                    }
                ],
                // Result
                function (err) {
                    if (err)
                        callback(err);
                    else
                        callback(null);
                });
        }
        else {
            payload.data = JSON.stringify(options.data);
            payload.length = payload.data.length;
            callback(null);
        }
    }

    /*
     * Build the request parameters and headers
     */
    function buildRequestParams(options, callback) {

        var parsedUrl = urlLib.parse(options.config.host);

        var params = {
            method: 'POST',
            protocol: parsedUrl.protocol,
            host: parsedUrl.host,
            port: parsedUrl.port || XlreHttp.getDefaultPort(),
            auth: options.config.username + ':' + options.config.password,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload.length
            }
        };

        if (options.data.file != undefined) {
            params.headers = {
                'Content-Type': 'multipart/form-data; boundary=' + boundary,
                'X-Atlassian-Token': 'nocheck',
                'Content-Length': payload.length
            };
            params.path = options.config.path + '/issue/' + options.data.fields.issue.key + '/attachments';
            callback(null, params);
        }
        else {
            params.path = options.config.path + '/issue/';
            callback(null, params);
        }
    }

    /*
     * Send the request and get a response
     */
    function sendRequest(params, callback) {
        var responseBody = '',
            request;

        var client = http;
        if (params.protocol == 'https:') {
            client = https;
        }

        request = client.request(params, function (response) {
            response.on('data', function (chunk) {
                responseBody += chunk;
            });

            response.on('end', function () {
                try {
                    callback(null, JSON.parse(responseBody));
                }
                catch (e) {
                    callback(null, responseBody);
                }
            });

            response.on('error', function (err) {
                callback(err, null);
            });
        });

        request.write(payload.head);
        request.write(payload.data);
        request.write(payload.tail);
        request.end();
    }

    setPayload(function (err) {
        if (err)
            callback(err, null);
        else {
            buildRequestParams(options, function (err, params) {
                if (err)
                    callback(err, null);
                else {
                    sendRequest(params, function (err, response) {
                        if (err)
                            callback(err, null);
                        else
                            callback(null, response);
                    });
                }
            });
        }
    });
};


exports.getBaseUrl = function () {
    var options = XlreConfig.readXlreConfig();

    var apiPath = options.jira.api_path;
    var host = options.jira.host;
    var password = Encoding.decode(options.jira.password);

    var protocol = host.split('://')[0];
    var domain = host.split('://')[1];

    return protocol + '://' + options.jira.login + ':' + password + '@' + domain + apiPath;
};