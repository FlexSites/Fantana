var glob = require('glob');

module.exports = function(gulp, pkg){

  glob.sync('/www/auto/gulp/*.js').forEach(function(file){
    if(__filename !== file) require(file)(gulp,pkg);
  });

  gulp.task('default', ['clean', 'html', 'css']);
};