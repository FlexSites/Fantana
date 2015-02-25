var _ = require('lodash');
var https = require('https');
var request = https.get;

module.exports = function(grunt) {
    'use strict';


    grunt.config('copy.site', {
        files: [
            {
                expand: true,
                cwd: 'source',
                src: ['**/*.jpg','**/*.png','**/*.ico','**/*.svg','**/*.jpeg','**/*.gif', '**/*.eot', '**/*.ttf', '**/*.woff'],
                dest: 'public',
                filter: 'isFile'
            }
        ]
    });

    grunt.loadNpmTasks('grunt-contrib-copy');

};
