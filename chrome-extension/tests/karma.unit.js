module.exports = function(config) {
    var browser = 'Chrome';

    config.set({
        basePath: '../js',
        frameworks: ['jasmine'],
        files: [
            '../js/services/*.js',
            '../js/controllers/*.js',
            '../js/filters/*.js',
            '../js/directives/*.js'
        ],
        preprocessors: {
            '../js/directives/**/*.html': 'ng-html2js',
            '../js/**/*.js': 'coverage',
            '**/*.coffee': 'coffee',
            '**/*.html' : ["ng-html2js"]
        },
        ngHtml2JsPreprocessor: {
            moduleName: "templates"
        },
        coverageReporter: {
            type: 'cobertura',
            dir: 'build/reports/karma/coverage/'
        },
        junitReporter: {
            outputFile: 'build/test-results/karma-test-results.xml'
        },
        exclude: [],
        reporters: ['progress', 'coverage', 'junit'],
        port: 9997,
        runnerPort: 9100,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: [browser],
        captureTimeout: 10000,
        singleRun: true
    });
};