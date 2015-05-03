xlRepoLinker.controller('ImportExportController',
    function ImportExportController($rootScope, $scope, JiraService, HttpService, xlRepoLinkerHost) {

    (function () {
        console.log('ImportExportController init');
        JiraService.init().then(function (value) {
            $scope.jiraHostUrl = value;
        }, function (error) {
            $scope.errorResult = error;
        });
    })();

    $scope.importSnapshot = function () {
        $scope.clear();
        $scope.status = 'Import is in progress...';

        HttpService.get('import/' + $scope.jiraIssue,
            {
                restartServerAfterImport: $scope.restartServerAfterImport
            }
        ).success(function (data) {
                $scope.jiraIssue = '';
                $scope.status = '';
                $scope.successResult = data;
            }).error(function (data, status) {
                $scope.errorResult = data;
                $scope.status = '';
                $scope.checkAndNotifyAboutServerConnection(status);
            });
    };

    $scope.exportSnapshot = function () {
        $scope.clear();
        $scope.status = 'Export is in progress...';

        HttpService.get('export/' + $scope.jiraIssue,
            {
                overwriteAlreadyExported: $scope.overwriteAlreadyExported
            }
        ).success(function (data) {
                $scope.jiraIssue = '';
                $scope.status = '';
                $scope.successResult = data;
            }).error(function (data, status) {
                $scope.errorResult = data;
                $scope.status = '';
                $scope.checkAndNotifyAboutServerConnection(status);
            });
    };

    $scope.pickUrl = xlRepoLinkerHost + 'pick?query=';

    $scope.checkAndNotifyAboutServerConnection = function (status) {
        if (status == 0) {
            $scope.errorResult = 'Server is not reachable. Please check that xl-repo-linker server is up and running';
        }
    };

    $scope.clear = function () {
        $scope.errorResult = '';
        $scope.successResult = '';
    };

    $scope.$watch('jiraIssue', function(value) {
        if (value) {
            $scope.$parent.jiraIssue = value.title;
        }
    });

    $scope.isImportDisabled = function () {
        console.log('isImportDisabled', $scope.jiraIssue, Boolean(!$scope.jiraIssue || $scope.status));
        return Boolean(!$scope.jiraIssue || $scope.status);
    };

    $scope.isExportDisabled = function () {
        return Boolean(!$scope.jiraIssue || $scope.status);
    };

});