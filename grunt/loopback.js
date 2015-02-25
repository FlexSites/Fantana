var _ = require('lodash');
var https = require('https');
var request = https.get;

module.exports = function(grunt) {
	'use strict';

	console.log('loopback');
	grunt.config({
		loopback_sdk_angular: {
			target: {
				options: {
					input: '/www/api/server.js',
					output: '/www/sites/global/ng/lb-services.js',
					ngModuleName: 'loopback',
					apiUrl: 'http://localapi.flexhub.io'
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-loopback-sdk-angular');

};
