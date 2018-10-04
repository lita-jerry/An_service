
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

	// 为了减少数据库查询频率,将 uid、nickName、avatar转成: uid*nickName*avatar 格式
	var _uid = ''+uid+'*'+nickName+'*'+avatarURL;

	console.log(uid, sid, roomid, _uid);
	console.log(channel.getMembers());

	console.log(channel.getMember(_uid));
	if (channel.getMember(_uid)) {
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
		
		channel.add(_uid, sid);
	}

	cb();
	// cb(this.get(roomid, false));
}

/**
 * Get user from trip channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} roomid trip room id
 * @param {boolean} flag channel parameter
 * @return {Array} users info in channel: [uid, nickName, avatar]
 *
 */
TripRemote.prototype.getUsersInRoom = function(roomid, cb) {
	var users = [];
	var channel = this.channelService.getChannel(roomid, false);
	if( !! channel) {
		users = channel.getMembers();
	}
	for(var i = 0; i < users.length; i++) {
		users[i] = {
			uid: users[i].split('*')[0],
			nickName: users[i].split('*')[1],
			avatar: users[i].split('*')[2]
		}
	}
	cb(null, users);
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
	var channel = this.channelService.getChannel(name, false);
	console.log('kick function\'s channel: channel'+channel);
	// leave channel
	if( !! channel) {
		channel.leave(uid, sid);
		var nickName = uid.split('*')[1];
		var param = {
			route: 'onLeave',
			user: nickName
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
TripRemote.prototype.uploadLocation = function(ordernumber, longitude, latitude, remark, cb) {
	mysql.execute('INSERT INTO trip_polyline (order_number, longitude, latitude, remark) VALUES(?,?,?,?)',
								[ordernumber, longitude, latitude, remark],
								function(_err, _result) {
									cb(_err);
								}
							);
}

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
TripRemote.prototype.getLogs = function(ordernumber, cb) {
	mysql.execute(
		'SELECT * FROM trip_logs WHERE order_number=?',
		[ordernumber],
		function(_err, _result) {
			if (_err) {
				cb(_err);
			} else {
				var datas = _result.map((currentValue, index, arr) => {
					return {
						eventType: currentValue['event_type'],
						operation: currentValue['operation'],
						remark: currentValue['remark']
					}
				});
				
				cb(null, datas);
			}
		}
	);
}

/**
 * 获取行程轨迹
 * 
 * @param {String} ordernumber 行程订单号
 * @param {Number} page 获取第page页的数据
 * @param {Number} count 获取数据的条目数
 * @param {Function} cb err, [longitude, latitude, remark, time]
 */
TripRemote.prototype.getPolyline = function(ordernumber, page, count, cb) {
	mysql.execute(
		'SELECT * FROM trip_polyline WHERE order_number=? limit ?,?',
		[ordernumber, page, count],
		function(_err, _result) {
			if (_err) {
				cb(_err);
			} else {
				var datas = _result.map((currentValue, index, arr) => {
					return {
						longitude: currentValue['longitude'],
						latitude: currentValue['latitude'],
						remark: currentValue['remark'],
						time: currentValue['created_time']
					}
				});
				
				cb(null, datas);
			}
		}
	);
}

/**
 * 获取最后出现的位置
 * 
 * @param {String} ordernumber 行程订单号
 * @param {Function} cb err, hasData, longitude, latitude, remark, time
 */
TripRemote.prototype.getLastPlace = function(ordernumber, cb) {
	mysql.execute(
		'SELECT * FROM trip_polyline WHERE order_number=? order by id DESC limit 1',
		[ordernumber],
		function(_err, _result) {
			if (_err) {
				cb(_err, false);
			} else if (_result.length > 0) {
				var longitude = _result[0]['longitude'];
				var latitude = _result[0]['latitude'];
				var remark = _result[0]['remark'];
				var time = _result[0]['created_time'];
				
				cb(null, true, longitude, latitude, remark, time);
			} else {
				cb(null, false);
			}
		}
	);
}

// 发出求救
TripRemote.prototype.SOS = function(ordernumber, cb) {}

// ------ 辅助函数 ------

/**
 * 添加行程日志
 * 
 * @param {String} ordernumber 行程订单号
 * @param {Number} event 事件类型 1,SOS求救
 * @param {String} operation 操作内容(显示到前端的内容)
 * @param {String} remark 备注(用于标注,不在前端显示)
 * @param {Function} cb 回调函数
 */
TripRemote.prototype.addLog = function(ordernumber, event, operation, remark, cb) {
	mysql.execute('INSERT INTO trip_logs (order_number, event_type, operation, remark) VALUES(?,?,?,?)',
								[ordernumber, event, operation, remark],
								function(_err, _result) {
									cb(_err);
								}
							);
}