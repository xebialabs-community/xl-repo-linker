'use strict';

xlRepoLinker.controller('ServerController', function ServerController($scope, HttpService, xlRepoLinkerHost) {

    (function () {
        HttpService.get('jiraHost').success(function (data) {
            $scope.jiraHostUrl = data;
            $scope.errorResult = '';
        }).error(function(errorMessage, status) {
            if (status == 0) {
                $scope.errorResult = 'Server is not reachable. Please check that xl-repo-linker server is up and running';
            } else {
                $scope.errorResult = errorMessage;
            }
        });
    })();

    $scope.importSnapshot = function () {
        $scope.clear();
        $scope.status = 'Import is in progress...';

        HttpService.get('import/' + $scope.jiraIssue.title,
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

        HttpService.get('export/' + $scope.jiraIssue.title,
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

    $scope.isImportDisabled = function () {
        return !$scope.jiraIssue;
    };

    $scope.isExportDisabled = function () {
        return !$scope.jiraIssue;
    };

});
