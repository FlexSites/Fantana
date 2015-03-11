var Flex = require('../gulp-resource');

module.exports = function(gulp, pkg){
  gulp.task('copy', function() {
    gulp.src(['source/**/*.jpg','source/**/*.png','source/**/*.ico','source/**/*.svg','source/**/*.jpeg','source/**/*.gif', 'source/**/*.eot', 'source/**/*.ttf', 'source/**/*.woff'])
      .pipe(gulp.dest(Flex.dest));
  });
};
