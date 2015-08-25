'use strict';

var xlRepoLinker = angular.module('xl-repo-linker-web', ['permission', 'ui.router', 'ngSanitize', 'react']);

var webState = {
    name: 'web',
    templateUrl: 'src/js/views/menu/mainMenu.html'
};

xlRepoLinker.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state(webState);
    $urlRouterProvider.otherwise('/commonConfiguration');
}]);
