var header = require('gulp-header')
  , prettify = require('gulp-prettify')
  , uglify = require('gulp-uglify')
  , minifyCSS = require('gulp-minify-css')
  , rev = require('gulp-rev')
  , revReplace = require('gulp-rev-replace')
  , gulpif = require('gulp-if')
  , imagemin = require('gulp-imagemin')
  , sass = require('gulp-sass')
  , sourcemaps = require('gulp-sourcemaps')
  , gzip = require('gulp-gzip')
  , s3 = require('gulp-s3')
  , livereload = require('gulp-livereload')
  , awspublish = require('gulp-awspublish')
  , rename = require('gulp-rename');

var hogan = require('./gulp-hogan')
  , Flex = require('./gulp-resource');

var del = require('del')
  , fs = require('fs')
  , path = require('path');

module.exports = function(gulp, pkg){

  /** ALIASES **/
  gulp.task('watch',            ['default']);
  gulp.task('sass',             ['css']);
  gulp.task('build',            ['clean', 'assets']);

  /** TASKS **/
  gulp.task('default',          ['assetsDev'],            watch);
  gulp.task('build:livereload', ['assetsDev'],            reload);
  gulp.task('publish',          ['build'],                publish);
  gulp.task('assets',           ['css'],                  assets);
  gulp.task('assetsDev',        ['css'],                  assetsDev);
  gulp.task('css',                                        css);
  gulp.task('clean',                                      clean);
  gulp.task('stage',                                      deploy);
  gulp.task('deploy',                                     deploy.bind(deploy, true));

  function publish() {

    // create a new publisher
    var publisher = awspublish.create({
      bucket: 'flex-sites',
    });

    // define custom headers
    var headers = {
       'Cache-Control': 'max-age=315360000, no-transform, public'
       // ...
     };

    return gulp.src('public/**/*')

      .pipe(rename(function (p) {
        p.dirname = path.join(process.cwd().split('/').pop(), 'public', p.dirname);
      }))

       // gzip, Set Content-Encoding headers and add .gz extension
      // .pipe(awspublish.gzip({ ext: '.gz' }))

      // publisher will add Content-Length, Content-Type and headers specified above
      // If not specified it will set x-amz-acl to public-read by default
      .pipe(publisher.publish(headers, {force: true}))

      // create a cache file to speed up consecutive uploads
      .pipe(publisher.cache())

       // print upload updates to console
      .pipe(awspublish.reporter());
  }

  /** FILESYSTEM WATCHER **/
  function watch(){
    livereload.listen();
    gulp.watch(['source/**/*', '!**/*.css'],  ['build:livereload']);
  }

  /** DELETE PUBLIC **/
  function clean(){
    del.sync([Flex.dest]);
  }

  function reload(){
    livereload.reload();
  }

    /** DELETE PUBLIC **/
  function css(){
    return gulp.src('source/scss/**.scss')
      .pipe(sass())

    // .pipe(sourcemaps.write('maps', {
    //     includeContent: false,
    //     sourceRoot: '/source'
    // }))

    .pipe(gulp.dest('source/css'));
  }

  /** BUILD PROCESS **/
  function assets() {
    return gulp.src(['source/**/*', '!**/*.scss'])

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
      .pipe(gulpif(isJSorCSS, rev()))

      // Replace sha'd references in all text files
      .pipe(revReplace())

      // Output stream to 'public'
      .pipe(gulp.dest('./public'));
  }

  function assetsDev(){
    return gulp.src(['source/**/*.*', '!**/*.scss'])
      .pipe(gulpif(isText, hogan()))
      .pipe(gulp.dest('./public'));
  }
  function isNotIndex(vinyl){
    return !/index\.html/.test(vinyl.relative);
  }

  function isJSorCSS(vinyl){
    return /\.(js|css)$/.test(vinyl.relative);
  }

  function isText(vinyl){
    return /\.(html|css|js)$/.test(vinyl.relative);
  }
};
