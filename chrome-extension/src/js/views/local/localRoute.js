'use strict';

xlRepoLinker.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('localRoute', {
        url: '/localRoute',
        parent: 'importExport',
        templateUrl: 'src/js/views/local/localView.html',
        controller: 'LocalController'
    });
}]);

xlRepoLinker.controller('LocalController',
    function LocalController($scope, $http, $location, HttpService, $sce) {

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.importSnapshot = function () {
            $scope.clear();
            $scope.status = 'Import is in progress...';

            HttpService.get('local/downloadfile?fileToDownloadTitle=' + $scope.packageName + '&restart=' + $scope.restartServerAfterImport)
                .success(function (data) {
                    $scope.packageName = '';
                    $scope.status = '';
                    $scope.successResult = data;
                }).error(function (err) {
                    $scope.errorResult = err;
                    $scope.status = '';
                });
        };

        $scope.exportSnapshot = function () {
            $scope.clear();
            $scope.status = 'Export is in progress...';

            HttpService.get('local/uploadfile?fileToUploadTitle=' + $scope.packageName + '&force=' + $scope.overwriteAlreadyExported)
                .success(function (data) {
                    $scope.packageName = '';
                    $scope.status = '';
                    $scope.successResult = data;
                }).error(function (err) {
                    $scope.errorResult = err;
                    $scope.status = '';
                });
        };

        $scope.clear = function () {
            $scope.errorResult = '';
            $scope.successResult = '';
        };

        $scope.$watch('packageName', function (value) {
            if (value) {
                $scope.clear();
                $scope.$parent.packageName = value;
            }
        });

        $scope.isImportDisabled = function () {
            return Boolean(!$scope.packageName || $scope.status);
        };

        $scope.isExportDisabled = function () {
            return Boolean(!$scope.packageName || $scope.status);
        };

        $scope.$parent.checkXldVersionCompatibility().error(function (err) {
            $scope.clear();
            $scope.errorResult = err || 'Server is not reachable. Please check that xl-repo-linker server is up and running';
        }).success(function () {
            $scope.clear();
        });
    });