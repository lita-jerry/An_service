
var userUtil = require('../../../util/user');
var tripUtil = require('../../../util/trip');
var mysql = require('../../../util/MySQL');

var async = require("async");

module.exports = function(app) {
	return new TripRemote(app);
};

var TripRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

// 进入行程房间
TripRemote.prototype.add = function(uid, sid, name, flag, cb) {}

// 查询未完成行程
TripRemote.prototype.queryUnfinished = function(uid, cb) {
	mysql.execute(
		'SELECT * FROM trip WHERE user_id = ? AND (state = 1 OR state = 3)',
		[uid],
		function(_err, _result) {
			if (_err) {
				cb(_err, false);
			} else if (_result.length > 0) {
				cb(null, true, _result[0]['order_number']);
			} else {
				cb(null, false); // 查询结果正常,但未查询到结果
			}
		}
	);
}

// 创建行程订单
TripRemote.prototype.create = function(uid, cb) {

	var ordernumber = tripUtil.makeTripOrderNumber();

	mysql.execute('INSERT INTO trip (order_number, user_id, state) VALUES(?,?,?)',
		[ordernumber, uid, 1],
		function(_err, _result) {
			if (_err) {
				cb(_err);
			} else {
				cb(null, ordernumber);
			}
		}
	);
}

// 结束行程
TripRemote.prototype.end = function(ordernumber, cb) {
	mysql.execute('UPDATE trip SET state = ? WHERE order_number = ?',
		[2, ordernumber],
		function(_err, _result) {
			if (_err) {
				cb(_err);
			} else if (_result['changedRows'] > 0) {
				cb();
			} else {
				cb('changed rows <= 0');
			}
		}
	);
}

// 上报行程位置
TripRemote.prototype.uploadLocation = function(ordernumber, longitude, latitude, cb) {}

/**
 * 查询行程信息
 * 
 * @param {String} ordernumber 行程订单号
 * @param {Function} cb err, hasData, userid, state, createdTime, lastUpdatedTime
 */
TripRemote.prototype.queryInfo = function(ordernumber, cb) {
	mysql.execute(
		'SELECT * FROM trip WHERE order_number = ?',
		[ordernumber],
		function(_err, _result) {
			if (_err) {
				cb(_err, false);
			} else if (_result.length > 0) {
				cb(null, true, _result[0]['user_id'], 
											 _result[0]['state'], 
											 _result[0]['created_time'], 
											 _result[0]['last_updated_time']);
			} else {
				cb(null, false);
			}
		}
	);
}

// 获取行程日志
TripRemote.prototype.getLogs = function(ordernumber, cb) {}

// 获取行程轨迹
TripRemote.prototype.getPolyline = function(ordernumber, cb) {}

// 发出求救
TripRemote.prototype.SOS = function(ordernumber, cb) {}

// ------ 辅助函数 ------
