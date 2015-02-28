'use strict';
var map = require('map-stream');
var es = require('event-stream');;
var gutil = require('gulp-util');
var Hogan = require('hogan.js');
var _ = require('lodash');

module.exports = function(options) {
  options = _.extend({
    data: {},
    partials: [],
    delimiters:'{{ }}',
    disableLambda: false
  }, options);
  return es.map(function (file, cb) {
    file.contents = new Buffer(Hogan.compile(file.contents.toString(), {
      delimiters: options.delimiters,
      disableLambda: options.disableLambda
    }).render(options.data, options.partials) );
    cb(null,file);
  });
};