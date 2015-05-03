module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-mocha-test')
  grunt.loadNpmTasks('grunt-release')
  require("load-grunt-tasks")(grunt)

  webDir = "chrome-extension"

  grunt.initConfig
    mochaTest:
      test:
        options:
          reporter: 'spec'
          captureFile: 'results.txt'
          quiet: false
          clearRequireCache: false
        src: ['test/**/*.js', 'chrome-extension/tests']
    connect:
      chrome:
        options:
          port: 3001
          hostname: "0.0.0.0"
          base: webDir
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
          "#{webDir}/src/js/**/*.js"
        ]

  grunt.registerTask "default", ["mochaTest"]

  grunt.registerTask "serve", ["configureProxies:dev", "connect:chrome", "watch"]
