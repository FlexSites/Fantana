var header = require('gulp-header')
  , sass = require('gulp-ruby-sass')
  , hogan = require('../gulp-hogan')
  , Flex = require('../gulp-resource');

module.exports = function(gulp, pkg){
  gulp.task('css', function() {
    sass('source/scss/')
      .pipe(header('/* ' + pkg.name + ' v' + pkg.version + ' */\n\n'))
      .pipe(hogan())
      .pipe(gulp.dest(Flex.dest + '/css'));
  });
};
