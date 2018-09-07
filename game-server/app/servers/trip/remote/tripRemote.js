
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

/**
 * Add user into trip channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} roomid trip channel room id
 * @param {String} nickName user's nick name
 * @param {String} avatarURL user's avatar url
 * @param {boolean} isOwner is it the trip's owner
 *
 */
TripRemote.prototype.add = function(uid, sid, roomid, nickName, avatarURL, isOwner, cb) {
	var channel = this.channelService.getChannel(roomid, true);
	
	console.log(uid, sid, roomid);
	console.log(channel.getMembers());

	console.log(channel.getMember(uid));
	if (channel.getMember(uid)) {
		cb('当前用户已在一个房间');
		return;
	}

	var param = {
		route: 'onAdd',
		nickName: nickName,
		avatarURL: avatarURL,
		isOwner: isOwner
	};
	channel.pushMessage(param);

	if( !! channel) {
		channel.add(uid, sid);
	}

	cb();
	// cb(this.get(roomid, false));
}

/**
 * Get user from trip channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
TripRemote.prototype.get = function(name, flag=false) {
	var users = [];
	var channel = this.channelService.getChannel(name, flag);
	if( !! channel) {
		users = channel.getMembers();
	}
	// for(var i = 0; i < users.length; i++) {
	// 	users[i] = users[i].split('*')[0];
	// }
	return users;
};

/**
 * Kick user out trip channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
TripRemote.prototype.kick = function(uid, sid, name, cb) {
	console.log(uid, sid, name);
	var channel = this.channelService.getChannel(name, false);
	console.log('kick function\'s channel: channel'+channel);
	// leave channel
	if( !! channel) {
		channel.leave(uid, sid);
		// var username = uid.split('*')[0];
		var param = {
			route: 'onLeave',
			user: 'username'
		};
		channel.pushMessage(param);
	}
	cb();
};


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
TripRemote.prototype.getInfo = function(ordernumber, cb) {
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

