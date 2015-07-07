/**
 * Created by faide on 6/2/2015.
 */
'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var newer = require('gulp-newer');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglifyify = require('uglifyify');

var path = {
      src: {
        alien: 'src/**/*.js'
      },
      dist: {
        alien: 'dist/'
      }
    };
var options = {
      modules: 'amd',
      stage: 0
    };

gulp.task('build:dev', function() {
  return gulp.src(path.src.alien)
      .pipe(newer(path.dist.alien))
      .pipe(sourcemaps.init())
      .pipe(babel(options))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(path.dist.alien));
});

// TODO: is there a way to make this more consistent with build:dev?
gulp.task('build:production', function() {
  return browserify({
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

gulp.task('default', ['clean', 'build:production']);
