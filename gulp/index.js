var header = require('gulp-header')
  , prettify = require('gulp-prettify')
  // , uglify = require('gulp-uglify')
  // , minifyCSS = require('gulp-minify-css')
  , rev = require('gulp-rev')
  , revReplace = require('gulp-rev-replace')
  , gulpif = require('gulp-if')
  // , imagemin = require('gulp-imagemin')
  , sass = require('gulp-sass')
  // , sourcemaps = require('gulp-sourcemaps')
  , s3 = require('gulp-s3')
  , livereload = require('gulp-livereload')
  , clc = require('cli-color')
  , s3 = require('s3')
  , bump = require('gulp-bump')
  , git = require('gulp-git')
  , argv = require('yargs').argv
  , version = require('gulp-tag-version')
  , request = require('superagent')
  , fs = require('fs')
  , path = require('path')
  , del = require('del');

var hogan = require('./gulp-hogan')
  , Flex = require('./gulp-resource');

module.exports = function(gulp, pkg){

  var runSequence = require('run-sequence').use(gulp);
  /** ALIASES **/
  gulp.task('watch',            ['default']);
  gulp.task('sass',             ['css']);

  /** TASKS **/
  gulp.task('default',          ['assetsDev'],            watch);
  gulp.task('build:livereload', ['assetsDev'],            reload);
  gulp.task('assets',           ['css'],                  assets);
  gulp.task('assetsDev',        ['css'],                  assetsDev);
  gulp.task('css',                                        css);
  gulp.task('clean',                                      clean);
  gulp.task('bump:patch',                                 bumpVer.bind(this, 'patch'));
  gulp.task('bump:minor',                                 bumpVer.bind(this, 'minor'));
  gulp.task('bump:major',                                 bumpVer.bind(this, 'major'));
  gulp.task('s3sync',                                     publish);
  gulp.task('push',                                       push);
  gulp.task('bustCache',                                  bustCache);

  /** ORDERED **/
  gulp.task('patch', deploy('patch'));
  gulp.task('minor', deploy('minor'));
  gulp.task('major', deploy('major'));
  gulp.task('build', function(done){
    runSequence('clean', 'assets', done);
  });

  function deploy(importance){
    return function(done){
      runSequence('bump:'+importance, 'build', ['s3sync', 'push'], 'bustCache', done);
    };
  }

  /** BOX MESSAGE IN THE CONSOLE **/
  function boxMessage(msg){
    var bar = [];
    for(var i = 0, len = msg.length+2; i < len; i++) bar.push('═');
    bar = bar.join('');

    console.log('╔'+bar+'╗\n║ '+ clc.green(msg) + ' ║\n╚'+bar+'╝');
  }

  function push(){
    git.push('origin', 'master', {args: ' --tags'});
  }

  function bumpVer(type) {
    if(!Flex.isProd()) return;

    type = type || 'patch';

    return gulp.src('./package.json')
      .pipe(bump({type: type}))
      .pipe(gulp.dest('./'))
      .pipe(git.commit('Deploying ' + type + ' version'))
      .pipe(version());
  }

  function bustCache(done){
    request
      .get('http://'+process.cwd().split('/').pop()+'/sex-panther')
      .end(function(){
        done();
      });
  }
  /** DEPLOYS TO S3 **/
  function publish(done) {

    var client = getS3Client();
    var dir = process.cwd();
    var site = dir.split('/').pop();
    var bucket = 'flex-sites';

    if(!Flex.isProd()) bucket += '-test';

    if(Flex.isLocal()) return;
      var params = {
        localDir: dir + '/public',
        deleteRemoved: true, // default false, whether to remove s3 objects
                             // that have no corresponding local file.

        s3Params: {
          Bucket: bucket,
          Prefix: site + '/public',
          // other options supported by putObject, except Body and ContentLength.
          // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
        },
      };
      var uploader = client.uploadDir(params);
      uploader.on('error', function(err) {
        console.error('unable to sync:', err.stack);
      });
      uploader.on('progress', function() {

        // console.log(uploader.progressAmount,uploader.progressTotal);
        // var percent = Math.floor((uploader.progressAmount / uploader.progressTotal)*100);
        // if(percent != lastPercent){
        //   console.log('Uploaded', lastPercent = percent, '%');
        // }
      });
      uploader.on('end', function() {
        boxMessage('DEPLOYED "'+process.cwd().split('/').pop()+'" TO '+Flex.getEnv());
        done();
      });
  }

  /** GET S3 CLIENT **/
  function getS3Client(){
    var credentials = require('../aws.json').credentials;
    return s3.createClient({
      maxAsyncS3: 20,     // this is the default
      s3RetryCount: 3,    // this is the default
      s3RetryDelay: 1000, // this is the default
      multipartUploadThreshold: 20971520, // this is the default (20 MB)
      multipartUploadSize: 15728640, // this is the default (15 MB)
      s3Options: {
        accessKeyId: credentials.key,
        secretAccessKey: credentials.secret,
        // any other options are passed to new AWS.S3()
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
      },
    });
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
      // .pipe(gulpif('*.js', uglify()))

      // Minify CSS
      // .pipe(gulpif('*.css', minifyCSS({ keepSpecialComments: 0 })))

      // Prettify HTML
      .pipe(gulpif('*.html', prettify({
        'indent_size': 2
      })))

      // Add versioned headers
      .pipe(gulpif('*.html', header('<!-- ' + pkg.name + ' v' + pkg.version + ' -->\n\n')))
      .pipe(gulpif(isJSorCSS, header('/* ' + pkg.name + ' v' + pkg.version + ' */\n\n')))

      // Optimize images
      // .pipe(imagemin({
      //   progressive: true,
      //   interlaced: true
      // }))

      // Add revision sha-sum
      .pipe(gulpif(isJSorCSS, rev()))

      // // Replace sha'd references in all text files
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
