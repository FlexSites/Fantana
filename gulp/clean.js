var del = require('del');

module.exports = function(gulp, pkg){
  gulp.task('clean', function(){
    del.sync(['public']);
  });
};