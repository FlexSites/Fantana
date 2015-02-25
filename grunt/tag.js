/*
 * grunt build task
 * https://github.com/blueimp/grunt-bump-build-git
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*global module */
module.exports = function(grunt) {
    'use strict';
    grunt.registerTask('tag', 'Tag the most recent merge with the version number', function() {
        var done = this.async();
        var exec = require('child_process').exec;
        var version = grunt.config('pkg.version');

        exec('git checkout master', function(err, stdout, stderr) {
            if (!stderr || /Already/.test(stderr)) {
                exec('git log --format="%H" --merges -1', function(err, stdout, stderr) {
                    if (stdout) {
                        exec('git tag -a ' + version + ' -m "Release ' + version + '" ' + stdout, function() {
                            console.log('tag', arguments);
                            done();
                        });
                        console.log('Tagged merge with version ' + version);
                    } else {
                        grunt.fatal('No merge commit found');
                    }
                })
            } else {
                grunt.fatal('Please checkout master before tagging');
            }
        });
    });
};
