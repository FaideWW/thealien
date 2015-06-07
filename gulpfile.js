/**
 * Created by faide on 6/2/2015.
 */
"use strict";

var gulp = require('gulp'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    newer = require('gulp-newer'),
    del = require('del'),


    path = {
        src: {
            js: 'src/**/*.js'
        },
        dist: {
            js: "dist/"
        }
    };

gulp.task('babel', function () {
    return gulp.src(path.src.js)
        .pipe(newer(path.dist.js))
        .pipe(sourcemaps.init())
        .pipe(babel({
            modules: 'amd',
            stage: 0
        }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(path.dist.js));
});

gulp.task('clean', function(cb) {
    return del(['dist'], cb);
});

//gulp.task('babelshort', function () {
//    return gulp.src(path.src.js)
//        .pipe(sourcemaps.init())
//        .pipe(concat("all.js"))
//        .pipe(babel({modules: 'amd'}))
//        .pipe(sourcemaps.write("."))
//        .pipe(gulp.dest(path.dist.js));
//});
