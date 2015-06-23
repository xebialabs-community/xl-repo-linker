module.exports = function(config) {
    config.set({
        basePath: '../src',
        frameworks: ["mocha", "sinon-chai", "chai"],
        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'js/app.js',
            'js/services/*.js',
            'js/controllers/*.js',
            'js/filters/*.js',
            'js/directives/**/*.js',
            '../tests/unit/**/*.coffee'
        ],
        preprocessors: {
            'js/directives/**/*.html': 'ng-html2js',
            'js/**/*.js': 'coverage',
            'js/**/*.html' : ["ng-html2js"],
            '../tests/unit/**/*.coffee': 'coffee'
        },
        ngHtml2JsPreprocessor: {
            moduleName: "templates"
        },
        coverageReporter: {
            type: 'cobertura',
            dir: '../build/reports/karma/coverage/'
        },
        junitReporter: {
            outputFile: '../build/test-results/karma-test-results.xml'
        },
        exclude: [],
        reporters: ['progress', 'coverage', 'junit'],
        port: 5437,
        runnerPort: 3122,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['PhantomJS'],
        captureTimeout: 10000,
        singleRun: true
    });
};