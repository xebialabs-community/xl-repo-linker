var bower = require('gulp-bower');
var browserify = require('gulp-browserify');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var del = require('del');
var gulp = require('gulp');
var karma = require('gulp-karma');
var less = require('gulp-less');
var mocha = require('gulp-mocha');
var path = require('path');
var runSequence = require('gulp-run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var util = require('gulp-util');

require('gulp-release-it')(gulp);

var paths = {
    scripts: ['web/src/js/**/*.js'],
    libs: ['web/src/bower_components/**/*.js']
};

gulp.task('bower', function () {
    return bower({cwd: './web'})
        .pipe(gulp.dest('./web/src/bower_components'))
});

gulp.task('bower-chrome', function () {
    return bower({cwd: './chrome-extension'})
        .pipe(gulp.dest('./chrome-extension/src/bower_components'))
});

gulp.task('clean', function (cb) {
    del(['build'], cb);
});

gulp.task('ce-karma', ['bower-all'], function () {
    // Be sure to return the stream
    return gulp.src(['chrome-extension/tests/unit/**/*.js'])
        .pipe(karma({
            configFile: 'chrome-extension/tests/karma.unit.js',
            action: 'run'
        }))
        .on('error', function (err) {
            throw err;
        });
});

gulp.task('less', function () {
    return gulp.src('web/src/assets/**/*.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(concat('xl-repo-linker.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('web/build/css'));
});


gulp.task('scripts', ['clean'], function () {
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(concat('all.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('web/build/js'));
});

gulp.task('connect', function () {
    connect.server({
        root: 'web',
        port: 3002
    });
});

gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['scripts', 'less']);
});

gulp.task('bower-all', function (cb) {
    runSequence('bower', 'bower-chrome', cb);
});

gulp.task('build', function (cb) {
    runSequence('bower-all', 'less', 'scripts', cb);
});

gulp.task('default', function (cb) {
    runSequence('build', 'watch', 'ce-karma', 'connect', cb);
});

gulp.task('smoke-tests', function () {
    return gulp.src(['vms/smoke-tests/test/**/*.js'], {read: false})
        .pipe(mocha({reporter: 'spec'}))
        .on('error', util.log);
});