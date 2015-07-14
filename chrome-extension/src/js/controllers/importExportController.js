xlRepoLinker.controller('ImportExportController',
    function ImportExportController($state, $scope, HttpService) {
        $scope.selectedLinkType = 'local';
        $scope.linkTypes = [
            {id: 'local', name: 'Local'}, {id: 'jira', name: 'Jira'}, {id: 'googleDrive', name: 'Google Drive'}
        ];

        $scope.changeType = function () {
            $state.go($scope.selectedLinkType + 'Route');
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