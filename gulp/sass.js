module.exports = function(grunt) {
    'use strict';

    var files = [
        {
            expand: true,
            cwd: 'source',
            src: ['**/*.scss','**/*.sass'],
            dest: "public/css",
            flatten: true,
            ext: '.css'
        }
    ]
        
    grunt.config('sass.dev', {
        options: {
            style: "expanded"
        },
        files: files
    });
    grunt.config('sass.prod', {
        options: {
            style: "compressed"
        },
        files: files
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
};
