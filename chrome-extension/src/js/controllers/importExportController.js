xlRepoLinker.controller('ImportExportController',
    function ImportExportController($state, $scope, HttpService) {
        $scope.selectedLinkType = 'local';
        $scope.linkTypes = [
            {id: 'local', name: 'Local'}, {id: 'jira', name: 'Jira'}, {id: 'googleDrive', name: 'Google Drive'}
        ];

        $scope.changeType = function () {
            $state.go($scope.selectedLinkType + 'Route');
        };

        $scope.checkXldVersionCompatibility = function() {
            return HttpService.get('xlrl/checkCompatibilityVersion?version=1.1.3');
        };

        $scope.checkConfig = function (mode) {
            return HttpService.get('xlrl/checkConfig?mode=' + mode);
        };

        $scope.checkConfigAndShowError = function (mode) {
            return HttpService.get('xlrl/checkConfig?mode=' + mode).error(function (err) {
                $scope.errorResult = err;
            });
        };
    });