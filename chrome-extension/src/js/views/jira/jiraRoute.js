'use strict';

xlRepoLinker.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('jiraRoute', {
        url: '/jiraRoute',
        parent: 'importExport',
        templateUrl: 'src/js/views/jira/jiraView.html',
        controller: 'ImportExportController'
    });
}]);