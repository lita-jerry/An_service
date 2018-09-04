
var userUtil = require('../../../util/user')
var mysql = require('../../../util/MySQL');

var async = require("async");

module.exports = function(app) {
	return new TripRemote(app);
};

var TripRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

TripRemote.prototype.add = function(uid, sid, name, flag, cb) {}

// 查询未完成行程
TripRemote.prototype.queryUnfinished = function(uid, cb) {}

// 创建行程订单
TripRemote.prototype.create = function(uid, cb) {}

// 结束行程
TripRemote.prototype.end = function(uid, ordernumber, cb) {}

// 上报行程位置
TripRemote.prototype.uploadLocation = function(ordernumber, longitude, latitude, cb) {}

// 查询行程信息
TripRemote.prototype.queryInfo = function(ordernumber, cb) {}

// 获取行程日志
TripRemote.prototype.getLogs = function(ordernumber, cb) {}

// 获取行程轨迹
TripRemote.prototype.getPolyline = function(ordernumber, cb) {}

// 发出求救
TripRemote.prototype.SOS = function(ordernumber, cb) {}

// ------ 辅助函数 ------

