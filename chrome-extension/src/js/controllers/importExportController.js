xlRepoLinker.controller('ImportExportController',
    function ImportExportController($state, $scope) {
        $scope.selectedLinkType = 'local';
        $scope.linkTypes = [
            {id: 'local', name: 'Local'}, {id: 'jira', name: 'Jira'}, {id: 'googleDrive', name: 'Google Drive'}
        ];

        $scope.changeType = function () {
            $state.go($scope.selectedLinkType + 'Route');
        }
    });