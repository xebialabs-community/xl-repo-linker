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
    $urlRouterProvider.otherwise('/jiraRoute');
}]);