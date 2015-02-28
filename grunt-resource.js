
var http = require('http');
var req = http.get;
var _ = require('lodash');
var Promise = Promise || require('promise');

function request(url){
  return new Promise(function(resolve, reject){
    req({
      hostname: (env === 'prod' ? '' : env) + 'api.flexhub.io',
      port: 80,
      path: url,
      rejectUnauthorized: false
    }, function(res) {
      res.setEncoding('utf8');
      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('end', function() {
        var json = isList?[]:{};
        try {
          json = JSON.parse(body);
          if(_.isArray(json) && json.length < 2){
            json = json[0];
          }
        }
        catch(ex){
          console.log(ex);
        }
        fn(null, json);
      });
    });
  });
}
module.exports = {
	sites: function(search, env, fn){
		search = search||'';
		return this.request('/sites/'+search, env, !!search, fn);
	},
	pages: function(siteId, env, fn) {
	    return this.request('/sites/'+siteId+'/pages', env, true, fn);
	},
	request: function(url, env, isList, fn){
		console.log('Connecting to http://'+(env === 'prod' ? '' : env) + 'api.flexhub.io'+url);
		return
	}
};