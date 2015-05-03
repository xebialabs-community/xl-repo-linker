xlRepoLinker.factory('HttpService', function ($http, xlRepoLinkerHost) {

    return {
        'get': function(url, params) {
            var defaults  = {"headers": {"Accept": 'application/json'}};
            return $http.get(xlRepoLinkerHost + url, {
                params: params
            }, defaults);
        }
    };

});