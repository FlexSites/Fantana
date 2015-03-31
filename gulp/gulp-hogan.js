
var es = require('event-stream')
  , Hogan = require('hogan.js')
  , _ = require('lodash')
  , Flex = require('./gulp-resource')
  , path = require('path')
  , fs = require('fs')
  , glob = require('glob')
  , Promise = Promise || require('bluebird');

var promises = {};
module.exports = function(options) {

  'use strict';

  options = _.extend({}, options);
  var pkg = require('../package.json');

  return es.map(function (file, cb) {
    getData(options.data).then(function(data){
      file.contents = new Buffer(Hogan.compile(file.contents.toString(), {
        delimiters: '<< >>',
        disableLambda: false
      }).render(data, getPartials()));
      cb(null,file);
    }, function(err){
      console.error(err);
    });
  });

  function getPartials(cb){
    var partials = glob.sync('/www/global/html/*.html').reduce(function(prev, curr) {
      prev[path.basename(curr).split('.')[0]] = Hogan.compile(fs.readFileSync(curr, 'utf8'), {
        delimiters: '<< >>'
      });
      return prev;
    }, {});
    if(cb) cb(partials);
    return partials;
  }

  function getData(data){
    var abbr = process.cwd().split('/').pop();
    if(promises[abbr]){
      return promises[abbr];
    }
    var p = new Promise(function(resolve, reject){
      if(data){
        return resolve(data);
      }
      Flex.getSites(abbr, function(err, sites) {
        if(err || !sites){
          return reject(err);
        }
        var site = sites[0];
        Flex.getPages(site.id, function(err, pages) {
          resolve(getConfig(_.extend({version: pkg.version, env: Flex.isProd() ? '' : Flex.getEnv()}, site), pages));
        });
      });
    });
    return promises[abbr] = p;
  }

  function getConfig(config, pages) {

    var env = Flex.getEnv();
    config.env = env === 'prod'?'':env;
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
      src = src.replace(/<<baseHost>>/gi, config.host);
    } else if (_.isArray(src)) {
      _.each(src, function(resource, index) {
        src[index] = formatResource(resource, config);
      });
    }
    return src;
  }
};