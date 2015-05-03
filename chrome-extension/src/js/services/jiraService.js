xlRepoLinker.factory('JiraService', function ($q, HttpService) {

    return {
        init: function() {
            var deferred = $q.defer();

            HttpService.get('jiraHost').success(function (data) {
                deferred.resolve(data);
            }).error(function (errorMessage, status) {
                if (status == 0) {
                    errorMessage = 'Server is not reachable. Please check that xl-repo-linker server is up and running';
                }
                deferred.reject(errorMessage);
            });

            return deferred.promise;
        }
    };

});