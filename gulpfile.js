var del = require('del');
var gulp = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var karma = require('gulp-karma');
var less = require('gulp-less');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var paths = {
    scripts: ['web/src/js/**/*.js'],
    libs: ['web/src/bower_components/**/*.js']
};

gulp.task('clean', function(cb) {
    del(['build'], cb);
});

gulp.task('ce-karma', function() {
    // Be sure to return the stream
    return gulp.src(['chrome-extension/tests/unit/**/*.js'])
        .pipe(karma({
            configFile: 'chrome-extension/tests/karma.unit.js',
            action: 'run'
        }))
        .on('error', function(err) {
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


gulp.task('scripts', ['clean'], function() {
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(concat('all.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('web/build/js'));
});

gulp.task('connect', function() {
    connect.server({
        root: 'web',
        port: 3002
    });
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts', 'less']);
});

gulp.task('default', ['watch', 'ce-karma', 'less', 'scripts']);