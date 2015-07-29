xlRepoLinker.factory('HttpService', function ($http, xlRepoLinkerHost) {

    var defaults = {"headers": {"Accept": 'application/json'}};

    return {
        'get': function (url, params) {
            return $http.get(xlRepoLinkerHost + url, {
                params: params
            }, defaults);
        },
        'post': function (url, data) {
            return $http({
                method: 'POST',
                url: xlRepoLinkerHost + url,
                data: data,
                headers: defaults
            });
        }
    };

});