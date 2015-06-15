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
    function GoogleDriveController($scope, $location, HttpService, xlRepoLinkerHost, $sce) {

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        //XlreConfig.readXlreConfig().googleDrive

        $scope.importSnapshot = function () {
            $scope.clear();
            $scope.status = 'Import is in progress...';
            //
            //HttpService.get('import/' + $scope.packageName,
            //    {
            //        restartServerAfterImport: $scope.restartServerAfterImport
            //    }
            //).success(function (data) {
            //        $scope.packageName = '';
            //        $scope.status = '';
            //        $scope.successResult = data;
            //    }).error(function (data, status) {
            //        $scope.errorResult = data;
            //        $scope.status = '';
            //        $scope.checkAndNotifyAboutServerConnection(status);
            //    });
        };

        $scope.exportSnapshot = function () {
            $scope.clear();
            $scope.status = 'Export is in progress...';

            HttpService.get('google-drive/uploadfile?fileToUploadTitle=' + $scope.packageName + '&fileToUploadPath=' + '',
                {
                    overwriteAlreadyExported: $scope.overwriteAlreadyExported
                }
            ).success(function (data) {
                    $scope.packageName = '';
                    $scope.status = '';

                    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
                        if (chrome.runtime.lastError) {
                            $scope.errorResult = chrome.runtime.lastError;
                        } else {
                            alert('my token is: ' + token);
                        }
                    });


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

        $scope.$watch('packageName', function (value) {
            if (value) {
                $scope.$parent.packageName = value;
            }
        });

        $scope.isImportDisabled = function () {
            return Boolean(!$scope.packageName || $scope.status);
        };

        $scope.isExportDisabled = function () {
            return Boolean(!$scope.packageName || $scope.status);
        };
    });

