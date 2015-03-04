var hogan = require('../gulp-hogan'),
  header = require('gulp-header'),
  prettify = require('gulp-prettify'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat');

var glob = require('glob'),
  Hogan = require('hogan.js'),
  fs = require('fs'),
  path = require('path'),
  del = require('del'),
  _ = require('lodash'),
  argv = require('yargs').argv;

var Flex = require('../gulp-resource');

module.exports = function(gulp, pkg) {
  var env = 'local';
  if (argv.t || argv.test) {
    env = 'test';
  } else if (argv.p || argv.prod) {
    env = 'prod';
  }
  gulp.task('js', function() {
    Flex.getSites(process.cwd().split('/').pop(), function(err, sites) {
      var site = sites[0];
      Flex.getPages(site.id, function(err, pages) {
        gulp.src(['source/ng/app.js', 'source/ng/**/*.js'])
          .pipe(concat('app.js')) 
          .pipe(hogan({ 
            delimiters: '<< >>',
            data: getConfig(_.extend({buildNumber: pkg.buildNumber, env: env === 'prod' ? '' : env}, site), pages)
          }))
          // .pipe(header('(function(window, angular, undefined) {"use strict";'))
          // .pipe(footer('})(window, window.angular);'))
          // .pipe(uglify())
          .pipe(gulp.dest('public/ng/'));
      });
    });
  });

  function getConfig(config, pages) {

    config.siteId = config.id;
    config.styles = formatResource(config.styles, config);
    config.scripts = formatResource(config.scripts, config);

    // PAGES
    if (!_.isArray(pages)) {
      pages = [];
    }
    pages.forEach(function(page, i) {
      pages[i] = _.pick(page, ['templateUrl', 'url', 'title', 'description']);
    });
    config.routes = JSON.stringify(pages);
    config.routesArray = pages;

    return config;
  }

  function formatResource(src, config) {
    if (_.isString(src)) {
      src = src.replace(/<<env>>/gi, config.env);
      src = src.replace(/<<baseHost>>/gi, config.host)
      if (/^\/[^/]/.test(src) && _.isNumber(config.buildNumber)) {
        src = src.replace(/(\D)\.(js|css)/, '$1' + config.buildNumber + '.$2')
      }
    } else if (_.isArray(src)) {
      _.each(src, function(resource, index) {
        src[index] = formatResource(resource, config);
      });
    }
    return src;
  }
}