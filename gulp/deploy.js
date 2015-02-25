
var async = require('async');
var GruntResource = require('./grunt-resource');
var clc = require('cli-color');

module.exports = function(grunt) {
 
	grunt.registerTask('deploy', function(env) {

		env = env || 'local';
		var done = this.async();

		// BANNER
		var banner = '------ DEPLOYING '+env.toUpperCase()+' ------';
		if(env !== 'prod'){
			banner = clc.yellow(banner);
		}
		else {
			banner = clc.red(banner);
		}
		grunt.log.writeln(banner);

		// SITES
		GruntResource.sites(false, env, function(err,sites){
			async.eachSeries(sites,function(site,fn){
				var path = '/www/sites/'+site.abbr;

				
				if(!grunt.file.exists(path)){
					console.log('Doesn\'t exists. Cloning from repo:',site.repo);
					require('shelljs').exec('git clone '+site.repo+' '+path);
					fn();
				}
				else {
					grunt.util.spawn({
						grunt: true,
						args:['build:'+env],
						opts: {
							cwd: path
						}
					},
					
					function(err, result, code) {
						if (!err) {
							grunt.log.writeln(clc.green('Sucessfully deployed ' + site.host));
						}
						else {
							grunt.log.writeln(clc.red('Deployment failed for ' + site.host));
						}
						fn();
					})
				}
			}, function(err){
				if(err){
					grunt.log.writeln(err);
				}
			})
		});
	});
 
	grunt.registerTask('default', ['build']);
};