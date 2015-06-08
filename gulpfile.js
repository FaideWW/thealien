/**
 * Created by faide on 6/2/2015.
 */
"use strict";

var gulp = require('gulp'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    newer = require('gulp-newer'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    uglifyify = require('uglifyify'),


    path = {
        src: {
            alien: 'src/**/*.js'
        },
        dist: {
            alien: "dist/"
        }
    },
    options = {
        modules: 'amd',
        stage: 0
    };

gulp.task('build:dev', function () {
    return gulp.src(path.src.alien)
        .pipe(newer(path.dist.alien))
        .pipe(sourcemaps.init())
        .pipe(babel(options))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(path.dist.alien));
});

// TODO: is there a way to make this more consistent with build:dev?
gulp.task('build:production', function () {
    browserify({
        entries: [
            'node_modules/babel-core/browser-polyfill.js',
            'src/main.js'
        ],
        debug: true
    })
        .transform(babelify.configure({
            stage: 0
        }))
        .transform(uglifyify)
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest('./dist'));
});

//gulp.task('build:production', function () {
//    return gulp.src(path.src.alien)
//        .pipe(sourcemaps.init())
//        .pipe(babel({stage: 0}))
//        .pipe(concat('all.js'))
//        .pipe(uglify())
//        .pipe(sourcemaps.write("."))
//        .pipe(gulp.dest(path.dist.alien));
//});

gulp.task('clean', function(cb) {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});