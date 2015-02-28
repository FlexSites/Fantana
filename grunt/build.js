module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('build', function(env) {

        // Default alias env is dev
        var aliasEnv = env === 'prod'?env:'dev';
        var tasks = [];

        // Increment build number or create new file
        writeBuildFile(!grunt.file.exists('./build.json') ? 0 : ++grunt.file.readJSON('./build.json').buildNumber);

        // Run commands in specified environments
        if(env === 'test' || env === 'prod'){
            tasks.push('git:checkout:'+(env==='prod'?'master':'dev'), 'git:pull');
        }
        tasks.push('sass:' + aliasEnv, 'render:' + (!!env?env:'local'), 'copy:site');
        grunt.task.run(tasks);
    });

    // Alias default to build
    grunt.registerTask('default', ['build']);

    // Save a new buildNumber file
    function writeBuildFile(num) {
        grunt.file.write('./build.json', JSON.stringify({
            buildNumber: num
        }));
    }
};
