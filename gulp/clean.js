var del = require('del')
  , Flex = require('../gulp-resource');

module.exports = function(gulp, pkg){
  gulp.task('clean', function(){
    del.sync([Flex.dest]);
  });
};