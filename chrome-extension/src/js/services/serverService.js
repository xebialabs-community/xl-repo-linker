xlRepoLinker.factory('HttpService', function ($http) {

    return {
        'get': function(url, params) {
            var defaults  = {"headers": {"Accept": 'application/json'}};
            return $http.get(url, {
                params: params
            }, defaults);
        }
    };

});