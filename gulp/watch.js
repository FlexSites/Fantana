module.exports = function(grunt) {
    'use strict';

    grunt.config('watch.site', {
        files: ['../global/source/ng/modules/*.js','source/**/*.js', 'source/**/*.html', 'source/**/*.scss', 'source/**/*.sass'],
        tasks: ['build'],
        options: {
            spawn: false,
            atBegin: true,
            compress: {
                warnings: false
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
};
