/*
 * grunt-hogan-static
 * https://github.com/dlasky/grunt-hogan-static
 *
 * Copyright (c) 2013 Dan Lasky
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    grunt.config('bundle.prod', {
        options: {
            host: 'http://resume.sethtippetts.com'
        },
        files: [{
            src: 'public/index.html',
            dest: 'public/index.html'
        }, {
            src: 'public/css',
            dest: 'public/index.html'
        }]
    });

    grunt.registerMultiTask('bundle', 'Replaces all relative URLs with absolute ones', function() {

        var options = this.options({
            host: ''
        });

        this.files.forEach(function(f) {

            var ext = f.src.split('.').pop();

            var replaced = grunt.file.read(f.src);

            if (ext === 'html') {
                replaced = replaced.replace(/<(script|link|img)(.*?)(src|href)="(\/[^\/][^"]*)"/gi, '<$1$2$3="' + options.host + '$4"');
            } else if (ext === 'css') {
                replaced = replaced.replace(/f/, '');
            }


            grunt.file.write(f.dest, replaced);
            grunt.log.writeln("Wrote file:" + f.dest);

        });
    });

};
