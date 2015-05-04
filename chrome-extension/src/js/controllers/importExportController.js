xlRepoLinker.controller('ImportExportController',
    function ImportExportController($state, $scope) {
        $scope.selectedLinkType = 'jira';
        $scope.linkTypes = [
            {id: 'jira', name: 'Jira'}, {id: 'googleDrive', name: 'Google Drive'}
        ];

        $scope.changeType = function () {
            $state.go($scope.selectedLinkType + 'Route');
        }
    });