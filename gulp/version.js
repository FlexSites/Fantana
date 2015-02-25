module.exports = function(grunt) {
    'use strict';

    grunt.config('version', {
        gitAdd: 'package.json'
    })

    grunt.registerTask(
        'version',
        'Bump the version, build the project and add, commit and tag in git in one step.',
        function(version, message) {
            var tasks = ['bump:' + (version || '')],
                gitAdd = grunt.config('version.gitAdd');
            message = (message || 'Updating version number for ' + version).replace(':', '\\:');
            if (gitAdd !== false) {
                tasks.push('git:add' + (gitAdd ? ':' + gitAdd : ''));
            }
            tasks.push('git:commit:' + message);
            grunt.task.run(tasks);
        }
    );
};
