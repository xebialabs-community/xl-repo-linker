xlRepoLinker.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state({
        name: 'web.commonConfiguration',
        url: '/commonConfiguration',
        parent: webState,
        templateUrl: 'src/js/views/common/commonConfiguration.html',
        controller: 'CommonConfigurationController'
    });
}]);

xlRepoLinker.controller('CommonConfigurationController',
    function CommonConfigurationController($scope, HttpService) {

        $scope.getConfig = function () {
            HttpService.get('xlrl/readConfig').success(function (data) {

                var flattenConfig = {};

                _.forEach(Object.keys(data), function (key) {
                    _.forEach(Object.keys(data[key]), function (key2) {
                        flattenConfig[key + '.' + key2] = data[key][key2];
                    });
                });

                $scope.xlrlConfig = flattenConfig;
            }).error(function (err) {
                console.log(err);
            });
        };

        $scope.getConfig();

    });
