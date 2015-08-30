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

        function getKeyValue(config, compositeKey) {
            var keys = compositeKey.split('.');
            var groupKey = keys[0];
            var key = keys[1];

            var groupItems = config.groups[groupKey];
            var foundItem = _.find(groupItems, function (item) {
                return item.key === key;
            });

            if (!foundItem) {
                return undefined;
            }

            return foundItem.value;
        }

        var checkConfiguration = function (config) {
            $scope.infoMessage = 'Checking the configuration...';

            HttpService.get('xlrl/checkConfig?mode=' + getKeyValue(config, 'common.mode')).success(function () {
                $scope.infoMessage = undefined;
                $scope.configFormData = {data: config, errors: {}};
            }).error(function (err) {
                $scope.infoMessage = undefined;
                $scope.configFormData = {data: config, errors: err};
            });
        };

        $scope.configFormData = {};

        $scope.updateState = function (data) {
            $scope.configFormData = {data: data, errors: {}};
        };

        $scope.updateValues = function (config) {
            HttpService.post('xlrl/updateConfig', {data: config});
            checkConfiguration(config);
        };

        $scope.getConfig = function () {
            HttpService.get('xlrl/readConfig').success(function (config) {
                checkConfiguration(config);
            }).error(function (err) {
                console.log(err);
            });
        };

        $scope.getConfig();

    });
