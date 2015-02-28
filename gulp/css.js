var header = require('gulp-header')
  , sass = require('gulp-ruby-sass');

module.exports = function(gulp, pkg){
  gulp.task('css', function() {
    sass('source/scss/')
      .pipe(header('/* ' + pkg.name + ' v' + pkg.version + ' */\n\n'))
      .pipe(gulp.dest('public/css'));
  });
};
