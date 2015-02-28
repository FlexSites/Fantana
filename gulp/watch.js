module.exports = function(gulp, pkg){
  gulp.task('watch', function(){
    gulp.watch('source/**/*.scss', ['css']);
    gulp.watch('source/**/*.html', ['html']);
  });
};
