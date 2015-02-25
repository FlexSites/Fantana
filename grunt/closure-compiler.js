module.exports = function(grunt) {
    'use strict';
    var message = (grunt.config.get('buildPath') || grunt.config.get('pkg.name')).split('/').pop().replace(/-/gi, ' ').toUpperCase() + ' - VERSION ' + grunt.config.get('pkg.version');

    grunt.config('closure-compiler.prod', {
        "closurePath": "/comedian/app",
        "js": [
            "../global/public/ng/lib/angular.min.js",
            "../global/public/ng/lib/angular-route.min.js",
            "public/ng/global.js"
        ],
        "jsOutputFile": "public/ng/min/global.js",
        "maxBuffer": 500,
        "options": {}
    });
    grunt.loadNpmTasks('grunt-closure-compiler');
};
