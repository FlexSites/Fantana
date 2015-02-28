var hogan = require('../gulp-hogan')
  , header = require('gulp-header')
  , prettify = require('gulp-prettify');

var glob = require('glob')
  , Hogan = require('hogan.js')
  , fs = require('fs')
  , path = require('path')
  , del = require('del');

module.exports = function(gulp, pkg){
  gulp.task('html', function() {
    gulp.src('source/**/*.html')
      .pipe(hogan({
        data: {},
        delimiters: '<< >>',
        partials: glob.sync('/www/global/html/*.html').reduce(function(prev, curr) {
          prev[path.basename(curr).split(".")[0]] = Hogan.compile(fs.readFileSync(curr, 'utf8'), {
            delimiters: '<< >>'
          });
          return prev;
        }, {})
      }))
      .pipe(prettify({indent_size: 2}))
      .pipe(header('<!-- ' + pkg.name + ' v' + pkg.version + ' -->\n\n'))
      .pipe(gulp.dest('public'));
  });
}