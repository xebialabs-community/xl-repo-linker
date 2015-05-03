'use strict';

xlRepoLinker.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('googleDriveRoute', {
            url: '/googleDriveRoute',
            templateUrl: 'src/js/views/googleDrive/googleDriveView.html',
            controller: 'GoogleDriveController'
        });
    }])
    .controller('GoogleDriveController', function GoogleDriveController($scope, HttpService, xlRepoLinkerHost) {

    });