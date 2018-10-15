
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
 * Get user from trip channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} ordernumber trip room id
 * @param {boolean} flag channel parameter
 * @return {Array} users info in channel: [uid, nickName, avatar]
 *
 */
TripRemote.prototype.getUsersInRoom = function(ordernumber, cb) {
	var users = [];
	var channel = this.channelService.getChannel(ordernumber, false);
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
 * @param {Function} cb err, [{longitude, latitude, remark, time}]
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
 * @param {Number} event 事件类型 1,SOS求救 2,房主恢复连接 3,房主断开连接
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

/**
 * 行程房主加入Channel
 * 
 * @param {String} ordernumber 行程订单号
 * @param {Function} cb 回调函数
 */
TripRemote.prototype.tripCreatorAdd = function(uid, sid, ordernumber, nickName, avatarURL, cb) {

	var self = this;

	async.waterfall([
		function(_cb) {
			mysql.execute('UPDATE trip SET state = ? WHERE order_number = ? AND (state = 3 OR state = 1)',
				[1, ordernumber],
				function(_err, _result) {
					if (_err) {
						_cb(_err);
					} else if (_result['changedRows'] > 0) {
						_cb();
					} else {
						_cb('changed rows <= 0');
					}
				}
			);
		},
		function(_cb) {
			mysql.execute('INSERT INTO trip_logs (order_number, event_type, operation, remark) VALUES(?,?,?,?)',
				[ordernumber, 2, '恢复连接', ''],
				function(_err, _result) { _cb(_err); }
			);
		},
		function(_cb) {
			var channel = self.channelService.getChannel(ordernumber, true);

			// 为了减少数据库查询频率,将 uid、nickName、avatar转成: uid*nickName*avatar 格式
			var _uid = ''+uid+'*'+nickName+'*'+avatarURL;
			console.log('Tripping房主进入: ', _uid);
			if (!!channel.getMember(_uid)) {
				_cb('当前用户已在一个房间');
				// return;
				channel.leave(_uid, sid);
			}

			var param = {
				route: 'onTripCreatorAdd'
			};
			channel.pushMessage(param);
			channel.add(_uid, sid);
			_cb();
		}
	],
	function(_err) {
		cb(_err);
	});
}

/**
 * 行程房主离开Channel
 * 
 * @param {String} ordernumber 行程订单号
 * @param {Function} cb 回调函数
 */
TripRemote.prototype.tripCreatorLeave = function(uid, sid, ordernumber, nickName, avatarURL, cb) {

	var self = this;

	async.waterfall([
		function(_cb) {
			mysql.execute('UPDATE trip SET state = ? WHERE order_number = ? AND state = 1',
				[3, ordernumber],
				function(_err, _result) {
					if (_err) {
						_cb(_err);
					} else if (_result['changedRows'] > 0) {
						_cb();
					} else {
						_cb('changed rows <= 0');
					}
				}
			);
		},
		function(_cb) {
			mysql.execute('INSERT INTO trip_logs (order_number, event_type, operation, remark) VALUES(?,?,?,?)',
				[ordernumber, 3, '断开连接', ''],
				function(_err, _result) { _cb(_err); }
			);
		},
		function(_cb) {
			var channel = self.channelService.getChannel(ordernumber, false);
			console.log('kick function\'s channel: channel'+channel);
			// leave channel
			if( !! channel) {
				var param = {
					route: 'onTripCreatorLeave'
				};
				channel.pushMessage(param);
				var _uid = ''+uid+'*'+nickName+'*'+avatarURL;
				console.log('Tripping房主离开: ', _uid);
				channel.leave(_uid, sid);
			}
		}
	],
	function(_err) {
		cb(_err);
	});
}

/**
 * 行程观察者加入Channel
 * 
 * @param {String} ordernumber 行程订单号
 * @param {Function} cb 回调函数
 */
TripRemote.prototype.tripWatcherAdd = function(uid, sid, ordernumber, nickName, avatarURL, cb) {

	var self = this;

	var channel = self.channelService.getChannel(ordernumber, true);

	// 为了减少数据库查询频率,将 uid、nickName、avatar转成: uid*nickName*avatar 格式
	var _uid = ''+uid+'*'+nickName+'*'+avatarURL;

	if (channel.getMember(_uid)) {
		cb('当前用户已在一个房间');
		return;
	}

	var param = {
		route: 'onTripWatcherAdd',
		nickName: nickName,
		avatarURL: avatarURL
	};
	channel.pushMessage(param);
	channel.add(_uid, sid);

	cb();
}

/**
 * 行程观察者离开Channel
 * 
 * @param {String} ordernumber 行程订单号
 * @param {Function} cb 回调函数
 */
TripRemote.prototype.tripWatcherLeave = function(uid, sid, ordernumber, nickName, avatarURL, cb) {

	var _uid = ''+uid+'*'+nickName+'*'+avatarURL;

	var channel = this.channelService.getChannel(ordernumber, false);
	console.log('kick function\'s channel: channel'+channel);
	// leave channel
	if( !! channel) {
		var param = {
			route: 'onTripWatcherLeave',
			nickName: nickName,
			avatarURL: avatarURL
		};
		channel.pushMessage(param);
		channel.leave(_uid, sid);
	}

	cb();
}