
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
  var pkg = require(process.cwd()+'/package.json');

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
    var host = process.cwd().split('/').pop();
    if(promises[host]){
      return promises[host];
    }
    var p = new Promise(function(resolve, reject){
      if(data){
        return resolve(data);
      }
      Flex.getSiteByHost(host, function(err, sites) {
        if(!sites || !sites.length) err = new Error('Site "'+host+'" not found');
        if(err) return reject(err);

        var site = sites[0];
        Flex.getPages(site.id, function(err, pages) {
          var config = _.extend({
            version: pkg.version,
            env: Flex.getEnv(),
            prefix: Flex.isProd() ? '' : Flex.getEnv()
          }, pkg.data||{}, site);
          resolve(getConfig(config, pages));
        });
      });
    });
    return (promises[host] = p);
  }

  function getConfig(config, pages) {

    var env = Flex.getEnv();
    config.env = env === 'prod'?'www':env;
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
      config.baseHost = config.host;
      src = Hogan.compile(src, {
        delimiters: '<< >>',
        disableLambda: false
      }).render(config);
    } else if (Array.isArray(src)) {
      src = src.map(function(resource){
        return formatResource(resource, config);
      });
    }
    return src;
  }
};
