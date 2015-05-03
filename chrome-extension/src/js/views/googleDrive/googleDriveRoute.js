'use strict';

xlRepoLinker.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('googleDriveRoute', {
        url: '/googleDriveRoute',
        parent: 'importExport',
        templateUrl: 'src/js/views/googleDrive/googleDriveView.html',
        controller: 'ImportExportController'
    });
}]);