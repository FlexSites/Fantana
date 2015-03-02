var hogan = require('../gulp-hogan'),
  header = require('gulp-header'),
  prettify = require('gulp-prettify');

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
  gulp.task('html', function() {
    Flex.getSites(process.cwd().split('/').pop(), function(err, sites) {
      var site = sites[0];
      Flex.getPages(site.id, function(err, pages) {
        gulp.src('source/**/*.html')
          .pipe(hogan({
            data: getConfig(_.extend({buildNumber: pkg.buildNumber, env: env === 'prod' ? '' : env}, site), pages),
            delimiters: '<< >>',
            partials: glob.sync('/www/global/html/*.html').reduce(function(prev, curr) {
              prev[path.basename(curr).split(".")[0]] = Hogan.compile(fs.readFileSync(curr, 'utf8'), {
                delimiters: '<< >>'
              });
              return prev;
            }, {})
          }))
          .pipe(prettify({
            indent_size: 2
          }))
          .pipe(header('<!-- ' + pkg.name + ' v' + pkg.version + ' -->\n\n'))
          .pipe(gulp.dest('public'));
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