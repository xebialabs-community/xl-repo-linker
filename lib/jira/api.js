var async = require('async');
var http = require('http');
var https = require('https');
var fs = require('fs');
var rp = require('request-promise');
var mime = require('mime');
var path = require('path');
var Q = require('q');
var urlLib = require('url');
var _ = require('lodash-node/compat');

var Files = require('../common/files');
var XlreHttp = require('../common/http.js');
var XlreConfig = require('../common/config.js');
var Encoding = require('../common/encoding.js');

var headers = {
    'Accept': 'application/json'
};

var JiraApi = function () {
};

JiraApi.prototype.getIssue = function (issue) {

    var rpOptions = {
        url: JiraApi.prototype.getBaseUrl() + '/issue/' + issue,
        method: 'GET',
        headers: headers
    };

    return rp(rpOptions);
};

JiraApi.prototype.getAttachment = function (attachmentId) {
    var rpOptions = {
        url: JiraApi.prototype.getBaseUrl() + '/attachment/' + attachmentId,
        method: 'GET',
        headers: headers
    };

    return rp(rpOptions);
};

JiraApi.prototype.deleteAttachment = function (xldAttachmentId) {
    var rpOptions = {
        url: JiraApi.prototype.getBaseUrl() + '/attachment/' + xldAttachmentId,
        method: 'DELETE',
        headers: headers
    };

    return rp(rpOptions);
};

JiraApi.prototype.findXldAttachmentId = function (issueData) {
    var attachmentId = undefined;
    _.each(JSON.parse(issueData).fields.attachment, function (attachment) {
        if (attachment.filename == "xld-snapshot.zip") {
            attachmentId = attachment.id;
        }
    });

    return attachmentId;
};

JiraApi.prototype.findXldAttachment = function (issueData) {
    var attachment = undefined;
    _.each(JSON.parse(issueData).fields.attachment, function (value) {
        if (value.filename == "xld-snapshot.zip") {
            attachment = value;
        }
    });

    return attachment;
};

JiraApi.prototype.uploadAttachment = function (zipFilePath, issue, force) {

    var deferred = Q.defer();

    JiraApi.prototype.getIssue(issue).then(function (issueData) {
        var xldAttachmentId = JiraApi.prototype.findXldAttachmentId(issueData);

        if (!xldAttachmentId || xldAttachmentId && force === "true") {
            var options = {
                config: {
                    "username": XlreConfig.getKeyValue('jira.login'),
                    "password": XlreConfig.getKeyValue('jira.password'),
                    "host": XlreConfig.getKeyValue('jira.host'),
                    "path": XlreConfig.getKeyValue('jira.api_path')
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
                JiraApi.prototype.post(options, function (err, response) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve('Attachment for issue ' + issue + ' has been successfully uploaded');
                    }
                });
            }

            if (xldAttachmentId) {
                JiraApi.prototype.deleteAttachment(xldAttachmentId).then(function () {
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

JiraApi.prototype.downloadAttachment = function (issue) {

    var deferred = Q.defer();

    JiraApi.prototype.getIssue(issue).then(function (issueData) {

        var attachment = JiraApi.prototype.findXldAttachment(issueData);
        if (attachment) {
            var attachmentName = attachment.filename;
            var attachmentUrl = attachment.content;

            var params = XlreHttp.createJiraBasicParams("GET", urlLib.parse(attachmentUrl).path);

            XlreHttp.getJiraClient().get(params, function (response) {
                Files.download(response, attachmentName).then(function (res) {
                    deferred.resolve(res);
                }).catch(function (err) {
                    deferred.reject(err);
                });
            });
        } else {
            deferred.reject('Nothing to import. XLD attachment for issue ' + issue + ' has not been found.');
        }
    }, function (error) {
        deferred.reject('Trying to get information about issue is failed. ' + error);
    });

    return deferred.promise;
};

JiraApi.prototype.post = function (options, callback) {
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
                    if (this.statusCode != 200) {
                        if (this.statusMessage === "Not Found") {
                            callback("Your artifact size is exceeds limits for Jira attachment file", null);
                        } else {
                            callback(this.statusMessage, null);
                        }
                    } else {
                        callback(null, JSON.parse(responseBody));
                    }
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
                        if ((typeof response) === "string") {
                            callback(response, null);
                        } else if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, response);
                        }
                    });
                }
            });
        }
    });
};


JiraApi.prototype.getBaseUrl = function () {

    var apiPath = XlreConfig.getKeyValue('jira.api_path');
    var host = XlreConfig.getKeyValue('jira.host');
    var login = XlreConfig.getKeyValue('jira.login');
    var password = XlreConfig.getKeyValue('jira.password');

    var protocol = host.split('://')[0];
    var domain = host.split('://')[1];

    return protocol + '://' + login + ':' + password + '@' + domain + apiPath;
};

module.exports = new JiraApi();