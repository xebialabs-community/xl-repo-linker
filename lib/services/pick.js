var rp = require('request-promise');
var jira = require('../jira/');
var url = require('url');

var Pick = function () {
};


Pick.prototype.execute = function (query, showSubTasks, showSubTaskParent) {

    var rpOptions = {
        //TODO: improve it
        url: jira.getBaseUrl() + '/issue/picker?query=' + query + '&showSubTasks=' + showSubTasks + '&showSubTaskParent=' + showSubTaskParent,
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    };

    return rp(rpOptions);
};

module.exports = new Pick();