'use strict';

var xlRepoLinker = angular.module('xl-repo-linker', ['angucomplete', 'truncate', 'ui.router']);

xlRepoLinker.config(
    function ($httpProvider, $locationProvider) {
        //$locationProvider.html5Mode({
        //    enabled: true,
        //    requireBase: false
        //});
    })
    .constant('xlRepoLinkerHost', 'http://localhost:3000/');

xlRepoLinker.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('importExport', {
            url: "/importExport",
            templateUrl: "src/js/views/importExport.html"
        });

    $urlRouterProvider.otherwise('/importExport/jiraRoute');
}]);