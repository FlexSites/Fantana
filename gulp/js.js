var hogan = require('../gulp-hogan'),
  header = require('gulp-header'),
  footer = require('gulp-footer'),
  prettify = require('gulp-prettify'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  gulpif = require('gulp-if');

var glob = require('glob'),
  Hogan = require('hogan.js'),
  fs = require('fs'),
  path = require('path'),
  del = require('del'),
  _ = require('lodash'),
  argv = require('yargs').argv;

var Flex = require('../gulp-resource');

module.exports = function(gulp, pkg) {
  var env = Flex.getEnv();
  var isProd = Flex.isProd();
  gulp.task('js', function() {
    gulp.src(['source/ng/app.js', 'source/ng/**/*.js'])
      .pipe(concat('app.js')) 
      .pipe(hogan())
      .pipe(gulpif(isProd, header('(function(window, angular, undefined) {"use strict";')))
      .pipe(gulpif(isProd, footer('})(window, window.angular);')))
      .pipe(gulpif(isProd, uglify()))
      .pipe(gulp.dest(Flex.dest + '/ng/'));
  });
}