var _ = require('lodash');
var http = require('http');
var request = http.get;
var path = require('path');
var marked = require('marked');

module.exports = function(grunt) {
    'use strict';


    // Register the task for 
    grunt.registerTask('markdown', function(env) {

        var done = this.async();

        var req = request({
            hostname: (env === 'prod' ? '' : env) + 'api.flexhub.io',
            port: 80,
            path: '/pages',
            rejectUnauthorized: false
        }, function(res) {
            var body = '';
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function() {
                // marked('I am using __markdown__.');
                var pages = JSON.parse(body||'{}');
                if(_.isArray(pages)){
                    _.each(pages,function(page){
                        var content = page.content;
                        if(page._templateUrl){
                            content = grunt.file.read('/www/sites'+page._templateUrl)
                        }
                        var content = page.type === 'html'?page.content:marked(page.content);
                        grunt.file.write('/www/sites/global/pages/'+page.id+'.html', content);
                    })
                }
                done();
            })
        });
        req.on('error', function(e) {
            grunt.fail.fatal('Couldn\'t retrieve site configuration');
        });
    });

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
};
