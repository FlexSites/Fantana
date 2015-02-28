var _ = require('lodash');
var http = require('http');
var request = http.get;
var async = require('async');
var pluralize = require('plural');

var GruntResource = require('./grunt-resource');

module.exports = function(grunt) {
    'use strict';

    // Register the task for 
    grunt.registerTask('render', function(env) {

        // Default env is local
        if (!env) env = 'local';
        var abbr = grunt.config('abbr');
        var done = this.async();
        var options = this.options();
        var modules = options.modules || [];
        var resources = options.resources || [];

        var uglifyFiles = ['/www/sites/global/bower_components/lodash/dist/lodash.min.js'];
        var hoganFiles = [
            {
                src: '../global/source/sitemap.xml',
                dest: 'public/sitemap.xml'
            }, {
                expand: true,
                cwd: 'source',
                src: ['**/*.html', '**/*.js'],
                dest: 'public',
                filter: 'isFile'
            }
        ];

        GruntResource.sites('?filter[where][abbr]='+process.cwd().split('/').pop(), env, function(err,site){
            GruntResource.pages(site.id, env, function(err, pages) {

                // CONFIG
                var config = _.extend({
                    env: env === 'prod' ? '' : env,
                    buildNumber: grunt.file.readJSON('./build.json')
                }, site);

                config.siteId = config.id;
                config.styles = formatResource(config.styles, config);
                config.scripts = formatResource(config.scripts, config);

                // PAGES
                if(!_.isArray(pages)){
                    pages = [];
                }
                pages.forEach(function(page,i){
                    pages[i] = _.pick(page,['templateUrl', 'url', 'title', 'description']);
                });
                config.routes = JSON.stringify(pages);
                config.routesArray = pages;

                // SDK
                config.resources = JSON.stringify(resources);

                ['App','Resource','Directive'].forEach(function(str){
                    hoganFiles.push({
                        src: '/www/sites/global/source/ng/modules/'+str+'Module.js',
                        dest: '/www/sites/'+abbr+'/public/tmp/'+str+'Module.js'
                    });
                    uglifyFiles.push('/www/sites/'+abbr+'/public/tmp/'+str+'Module.js');
                });
                uglifyFiles.push('source/ng/*.js');

                // HOGAN CONFIG
                grunt.config('hogan_static.sdk', {
                    options: {
                        delimiters: '<< >>',
                        usePartials: '/www/global/html/*.html',
                        data: config
                    },
                    files: hoganFiles
                });
                
                // UGLIFY CONFIG
                grunt.config('uglify.sdk', {
                    options: env==='prod'?{
                        mangle: true,
                        compress: true,
                        beautify: false
                    }:{
                        mangle: false,
                        compress: false,
                        beautify: true
                    },
                    files: [{
                        src: uglifyFiles,
                        dest: 'public/ng/FlexSite.js'
                    }]
                });

                // CLEAN CONFIG
                grunt.config('clean.sdk',{
                    files: [{
                        src: 'public/tmp'
                    }]
                })

                // RUN TASKS
                grunt.task.run(['hogan_static:sdk', 'uglify:sdk']);
                done();
            }).on('error', function(e) {
                grunt.fail.fatal('Couldn\'t retrieve site pages configuration');
                done(false);
            });
        }).on('error', function(e) {
            grunt.fail.fatal('Couldn\'t retrieve site configuration');
            done(false);
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

    function capitalize(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
};

