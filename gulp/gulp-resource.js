var request = require('http').get
  , argv = require('yargs').argv
  , path = require('path');

var pkg = require(process.cwd()+'/package.json');

var config = {
  getSites: function(siteId, next) {
    this.grequest('/sites'+(siteId?'/'+siteId:''), next);
  },
  getSiteByHost: function(host, next) {
    this.grequest('/sites?filter[where][host]='+host, next);
  },
  getPages: function(siteId, next) {
    this.grequest('/sites/' + siteId + '/pages', next);
  },
  grequest: function(path, next) {
    request({
      hostname: 'localapi.flexhub.io',
      port: 80,
      path: path,
      rejectUnauthorized: false
    }, function(res, error) {
      res.setEncoding('utf8');

      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('end', function() {
        next(null, JSON.parse(body));
      });
    }).on('error', function(err){
      if(err.code === 'ECONNREFUSED'){
        return next(new Error('Burgundy is not running.'));
      }
      next(err);
    });
  },
  getEnv: function(){
    var env = 'local';
    if (argv.t || argv.test) {
      env = 'test';
    } else if (argv.p || argv.prod) {
      env = 'prod';
    }
    return env;
  },
  isLocal: function(){
    return !(argv.t || argv.test || argv.p || argv.prod);
  },
  isStage: function(){
    return argv.t || argv.test;
  },
  isProd: function(){
    return argv.p || argv.prod;
  },
  dest: 'public'
};

if(!config.isLocal){
  config.dest += pkg.version;
}

module.exports = config;
