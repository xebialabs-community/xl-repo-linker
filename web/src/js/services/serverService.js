xlRepoLinker.factory('HttpService', function ($http) {

    var defaults = {"headers": {"Accept": 'application/json'}};

    return {
        'get': function (url, params) {
            return $http.get(url, {
                params: params
            }, defaults);
        },
        'post': function (url, data) {
            return $http({
                method: 'POST',
                url: url,
                data: data,
                headers: defaults
            });
        }
    };

});