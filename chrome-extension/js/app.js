'use strict';

var xlRepoLinker = angular.module('xl-repo-linker', ['angucomplete', 'truncate']);

xlRepoLinker.config(
    function ($httpProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
    })
    .constant('xlRepoLinkerHost', 'http://localhost:3000/');