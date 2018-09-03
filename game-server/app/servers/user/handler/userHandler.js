
var async = require("async");
var userUtil = require('../../../util/user')

module.exports = function(app) {
    return new Handler(app);
  };
  
  var Handler = function(app) {
    this.app = app;
  };
