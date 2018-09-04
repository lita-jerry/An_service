
var userUtil = require('../../../util/user')
var mysql = require('../../../util/MySQL');

var async = require("async");

module.exports = function(app) {
	return new TripRemote(app);
};

var TripRemote = function(app) {
	this.app = app;
};

// TripRemote.prototype.add = function(uid, rid, )