'use strict';

xlRepoLinker.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('googleDriveRoute', {
        url: '/googleDriveRoute',
        parent: 'importExport',
        templateUrl: 'src/js/views/googleDrive/googleDriveView.html',
        controller: 'GoogleDriveController'
    });
}]);

xlRepoLinker.controller('GoogleDriveController',
    function GoogleDriveController($scope, $http, $location, HttpService, xlRepoLinkerHost, $sce) {

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.importSnapshot = function () {
            $scope.clear();
            $scope.status = 'Import is in progress...';

            HttpService.get('google-drive/downloadfile?fileToDownloadTitle=' + $scope.packageName + '&restart=' + $scope.restartServerAfterImport)
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

            HttpService.get('google-drive/uploadfile?fileToUploadTitle=' + $scope.packageName + '&force=' + $scope.overwriteAlreadyExported)
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
            $scope.refreshTokenRequired = false;
        };

        $scope.$watch('packageName', function (value) {
            if (value) {
                $scope.clear();
                $scope.$parent.packageName = value;
            }
        });

        $scope.hasGoogleRefreshToken = function () {
            $scope.refreshTokenRequired = false;
            HttpService.get('google-drive/getTokenInfo').success(function () {
                $scope.errorResult = '';
            }).error(function () {
                $scope.errorResult = 'First you need to give an access to your Google Drive account';
                $scope.refreshTokenRequired = true;
            });

            return false;
        };

        $scope.shareAccess = function () {
            HttpService.get('google-drive/auth-to-gd');
        };

        $scope.isImportDisabled = function () {
            return Boolean(!$scope.packageName || $scope.status);
        };

        $scope.isExportDisabled = function () {
            return Boolean(!$scope.packageName || $scope.status);
        };

        $scope.$parent.checkXldVersionCompatibility().success(function () {
            $scope.$parent.checkConfig('google-drive').success(function () {
                $scope.hasGoogleRefreshToken();
            }).error(function (err) {
                $scope.clear();
                $scope.errorResult = err;
            });
        }).error(function (err) {
            $scope.clear();
            $scope.errorResult = err || 'Server is not reachable. Please check that xl-repo-linker server is up and running';
        });

    });