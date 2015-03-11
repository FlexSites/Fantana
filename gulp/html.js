var hogan = require('../gulp-hogan'),
  header = require('gulp-header'),
  prettify = require('gulp-prettify');

var glob = require('glob'),
  Hogan = require('hogan.js'),
  fs = require('fs'),
  path = require('path'),
  del = require('del'),
  _ = require('lodash'),
  argv = require('yargs').argv

var Flex = require('../gulp-resource');

module.exports = function(gulp, pkg) {
  var env = Flex.getEnv(argv);
  gulp.task('html', function() {
    gulp.src('source/**/*.html')
      .pipe(hogan())
      .pipe(prettify({
        'indent_size': 2
      }))
      .pipe(header('<!-- ' + pkg.name + ' v' + pkg.version + ' -->\n\n'))
      .pipe(gulp.dest(Flex.dest));
  });
};