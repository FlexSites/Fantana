var request = require('http').get;

module.exports = {
  getSites: function(siteId, next) {
    var path = '';
    if(siteId.length === 5){
      path = '?filter[where][abbr]='+siteId
    }
    else if(typeof siteId === 'string'){
      path = '/'+siteId;
    }
    this.grequest('/sites'+path, next);
  },
  getPages: function(siteId, next) {
    this.grequest('/sites/' + siteId + '/pages', next);
  },
  grequest: function(path, next) {
    request({
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      rejectUnauthorized: false
    }, function(res, error) {
      res.setEncoding('utf8');
      res.on('error', function(msg) {
        console.log('ERROR:', arguments);
      });

      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('end', function() {
        next(null, JSON.parse(body));
      });
    });
  }
}