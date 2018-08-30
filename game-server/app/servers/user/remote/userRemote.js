
var userUtil = require('../../../util/user')
var mysql = require('../../../util/MySQL');

var async = require("async");

module.exports = function(app) {
	return new UserRemote(app);
};

var UserRemote = function(app) {
	this.app = app;
};

/**
 * 设置用户信息
 * 
 * @param {String} userid 用户id,如果为null则添加新用户
 * @param {String} nickname 用户昵称
 * @param {String} avatar 用户头像url
 * @param {Number} type 类型 1:临时; 2:正式;
 * @param {Number} state 状态 1:正常; 2:作废(过渡第三方); 3:封禁
 * @param {Function} cb 回调函数 err:错误信息,如果为null表示执行成功
 */
UserRemote.prototype.setUser = function(userid, nickname, avatar, type, state, cb) {
	
	var executeSQL = '';
	var executeParams = [];
	
	if (!!userid) {
		// 更新用户信息
		executeSQL = 'UPDATE user SET '+
									'nick_name=IFNULL(?,nick_name), '+
									'avatar_url=IFNULL(?,avatar_url), '+
									'type=IFNULL(?,type), '+
									'state=IFNULL(?,state) '+
									'WHERE id=?';
		executeParams = [nickname, avatar, type, state, userid];
	} else {
		// 添加用户信息
		executeSQL = 'INSERT INTO user SET nick_name=?, avatar_url=?, type=?, state=?';
		executeParams = [nickname, avatar, type, state];
	}
	
	mysql.execute(executeSQL, executeParams, function(err, result){
		if (err) {
			cb(err, null);
		} else if (result['affectedRows'] < 1) {
			cb('SQL语句执行未生效', null);
		} else {
			cb(null, !!userid ? userid : result['insertId']);
		}
	});
}

/**
 * 根据登录Token获取用户登录信息
 *
 * @param {String} token 登录Token
 *
 */
UserRemote.prototype.getUserOnlineStateByToken = function(token, cb) {

	mysql.execute(
		'SELECT * FROM user_online_state WHERE client_session=?',
		[token],
		function (_err, _result) {

			var err = null;
			var uid = null;
			var platform = null;
			var state = null;
			var sessionKey = null;
			var createdTime = null;
			var lastUpdatedTime = null;

			if (_err) {
				err = _err;
			} else if (_result.length < 1) {
				err = 'Token无效';
			} else {
				uid = _result[0]['user_id'];
				platform = _result[0]['platform'];
				state = _result[0]['state'];
				sessionKey = _result[0]['server_session'];
				createdTime = _result[0]['created_time'];
				lastUpdatedTime = _result[0]['last_updated_time'];
			}

			cb(err, uid, platform, state, sessionKey, createdTime, lastUpdatedTime);
		}
	)
};

/**
 * 设置用户登录状态
 * 
 * @param {String} userid 用户id
 * @param {Number} platform 平台 1:小程序
 * @param {Number} state 状态 1:生效中; 2:过期
 * @param {String} client 客户端Token
 * @param {String} server 第三方服务器Session key
 */
UserRemote.prototype.setUserOnlineState = function(userid, platform, state, token, sessionKey, cb) {
	mysql.execute(
		'INSERT INTO user_online_state SET user_id=?,platform=?, state=?, client_token=?, session_key=? ON DUPLICATE KEY UPDATE platform=?, state=?, client_token=?, session_key=?',
		[userid, platform, state, token, sessionKey,  platform, state, token, sessionKey],
		function (_err, _result) {

			var err = null;

			if (_err) {
				err = _err;
			} else if (!_result['insertId']) {
				err = 'database error: setUserOnlineState result insertId == null';
			}

			cb(err);
		}
	);
};
