'use strict';

xlRepoLinker.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('jiraRoute', {
        url: '/jiraRoute',
        parent: 'importExport',
        templateUrl: 'src/js/views/jira/jiraView.html',
        controller: 'JiraController'
    });
}]);

xlRepoLinker.controller('JiraController',
    function JiraController($rootScope, $scope, JiraService, HttpService, xlRepoLinkerHost) {

        (function () {
            JiraService.init().then(function (value) {
                $scope.jiraHostUrl = value;
            }, function (error) {
                $scope.errorResult = error;
            });
        })();

        $scope.importSnapshot = function () {
            $scope.clear();
            $scope.status = 'Import is in progress...';

            HttpService.get('jira/import/' + $scope.jiraIssue.title,
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

            HttpService.get('jira/export/' + $scope.jiraIssue.title,
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

        $scope.pickUrl = xlRepoLinkerHost + 'jira/pick?query=';

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
            return Boolean(!$scope.jiraIssue || $scope.status);
        };

        $scope.isExportDisabled = function () {
            return Boolean(!$scope.jiraIssue || $scope.status);
        };

        $scope.$parent.checkConfigAndShowError('jira');
    });