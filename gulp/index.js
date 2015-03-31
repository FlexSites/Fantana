var header = require('gulp-header')
  , prettify = require('gulp-prettify')
  , uglify = require('gulp-uglify')
  , minifyCSS = require('gulp-minify-css')
  , rev = require('gulp-rev')
  , revReplace = require('gulp-rev-replace')
  , gulpif = require('gulp-if')
  , imagemin = require('gulp-imagemin')
  , rubySass = require('gulp-ruby-sass')
  , sourcemaps = require('gulp-sourcemaps')
  , gzip = require('gulp-gzip')

var hogan = require('./gulp-hogan')
  , Flex = require('./gulp-resource');

var glob = require('glob')
  , del = require('del')
  , fs = require('fs');

module.exports = function(gulp, pkg){

  /** TASKS **/
  gulp.task('default',  ['build'],  watch);
  gulp.task('watch',    ['default']);
  gulp.task('build',    ['clean', 'sass', 'assets']);
  gulp.task('sass',     sass);
  gulp.task('clean',    clean);
  gulp.task('assets',   assets);

  /** FILESYSTEM WATCHER **/
  function watch(){
    gulp.watch('source/**/*.*', ['build']);
  }

  /** DELETE PUBLIC **/
  function clean(){
    del.sync([Flex.dest]);
  }

    /** DELETE PUBLIC **/
  function sass(){
    rubySass('source/scss/')
    .on('error', function (err) {
        console.error('Error', err.message);
     })

    // .pipe(sourcemaps.write('maps', {
    //     includeContent: false,
    //     sourceRoot: '/source'
    // }))

    .pipe(gulp.dest('source/css'));
  }

  /** BUILD PROCESS **/
  function assets() {
    gulp.src(['source/**/*.*', '!**/*.scss'])

      // Hogan parse templates
      .pipe(gulpif(isText, hogan()))

      // Minify JS
      .pipe(gulpif('*.js', uglify()))

      // Minify CSS
      .pipe(gulpif('*.css', minifyCSS({ keepSpecialComments: 0 })))

      // Prettify HTML
      .pipe(gulpif('*.html', prettify({
        'indent_size': 2
      })))

      // Add versioned headers
      .pipe(gulpif('*.html', header('<!-- ' + pkg.name + ' v' + pkg.version + ' -->\n\n')))
      .pipe(gulpif(isJSorCSS, header('/* ' + pkg.name + ' v' + pkg.version + ' */\n\n')))

      // Optimize images
      .pipe(imagemin({
        progressive: true,
        interlaced: true
      }))

      // Add revision sha-sum
      .pipe(gulpif(isIndex, rev()))

      // Replace sha'd references in all text files
      .pipe(revReplace())


      // Output stream to 'public'
      .pipe(gulp.dest('./public'));
  }

  function isIndex(vinyl){
    return !/index\.html/.test(vinyl.relative);
  }

  function isJSorCSS(vinyl){
    return /\.(js|css)$/.test(vinyl.relative);
  }

  function isShad(vinyl){
    return /\-[0-9a-f]{8}\.(html|css|js)$/.test(vinyl.relative);
  }  
  function isText(vinyl){
    return /\.(html|css|js)$/.test(vinyl.relative);
  }
};
