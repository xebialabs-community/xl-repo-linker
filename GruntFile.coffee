module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-mocha-test')
  grunt.loadNpmTasks('grunt-release')

  require('grunt-bower-task')(grunt)
  require('grunt-karma')(grunt)
  require("load-grunt-tasks")(grunt)

  chromeExtensionDir = "chrome-extension"
  webDir = "web"
  webLibsDir = webDir + '/src/bower_components'
  ceLibsDir = webDir + '/src/bower_components'

  grunt.initConfig
    bower:
      webInstall:
        options:
          targetDir: webLibsDir,
          layout: 'byType',
          install: true,
          verbose: false,
          cleanTargetDir: false,
          cleanBowerDir: true
      chromeExtensionInstall:
        options:
          targetDir: ceLibsDir,
          layout: 'byType',
          install: true,
          verbose: false,
          cleanTargetDir: false,
          cleanBowerDir: true
    mochaTest:
      test:
        options:
          reporter: 'spec'
          captureFile: 'results.txt'
          quiet: false
          clearRequireCache: false
        src: ['test/unit/**/*.js']
    karma:
      options:
        configFile: "chrome-extension/tests/karma.unit.js"
      singleRun:
        singleRun: true
        autoWatch: false
      reload:
        singleRun: false
        autoWatch: true
    connect:
      webServer:
        options:
          port: 3002
          hostname: "0.0.0.0"
          base: webDir
          middleware: (connect, options) ->
            proxy = require("grunt-connect-proxy/lib/utils").proxyRequest
            return [
              connect.static(String(options.base))
              connect.directory(String(options.base))
            ]
      chromeExtension:
        options:
          port: 3001
          hostname: "0.0.0.0"
          base: chromeExtensionDir
          middleware: (connect, options) ->
            proxy = require("grunt-connect-proxy/lib/utils").proxyRequest
            return [
              connect.static(String(options.base))
              connect.directory(String(options.base))
            ]
      dev:
        proxies: [
          context: "/"
          host: "127.0.0.1"
          port: 3000
        ]
    watch:
      scriptsCommon:
        files: [
          "#{chromeExtensionDir}/src/js/**/*.*",
          "#{webDir}/src/**/*.*"
        ]

  grunt.registerTask "default", ["bower", "mochaTest", "karma:singleRun"]

  grunt.registerTask "serve", ["configureProxies:dev", "connect:chromeExtension", "connect:webServer", "watch"]
