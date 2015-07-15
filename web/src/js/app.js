'use strict';

var xlRepoLinker = angular.module('xl-repo-linker', ['angucomplete', 'truncate', 'ui.router', 'ngSanitize']);

xlRepoLinker.config(
    function ($httpProvider, $locationProvider) {
    })
    .constant('xlRepoLinkerHost', 'http://localhost:3000/');

xlRepoLinker.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('importExport', {
            url: "/importExport",
            templateUrl: "src/js/views/importExport.html",
            controller: "ImportExportController"
        });

    $urlRouterProvider.otherwise('/importExport/localRoute');
}]);