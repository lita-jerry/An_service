
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
 * 临时登录: 获取用户id、临时登录Token
 */
UserRemote.prototype.doTempLogin = function(username, avatar, type, state, cb) {
	console.log('到这里了吗？')
	async.waterfall([
		function (_cb) {
			mysql.execute(
				'INSERT INTO user (nick_name, avatar_url, type, state) VALUES(?,?,?, ?)',
				[username, avatar, type, state],
				function(_err, _result) {
					if (_err) {
						_cb('创建临时用户失败', null);
					}
					_cb(null, _result['insertId']);
				});
		},
		function (_userid, _cb) {
			var _token = userUtil.makeOnlineSession();
			mysql.execute(
				'INSERT INTO user_online_state SET user_id=?,type=1,client_session=? ON DUPLICATE KEY UPDATE type=1,client_session=?',
				[_userid, _token, _token],
				function (_err, _result) {
					if (!_err && !!_result['insertId']) {
						_cb(null, _userid, _token);
					} else {
						_cb('登录失败', null, null);
					}
				}
			);
		}
	], function (_err, _userid, _token) {
		if (_err) {
			cb(_err, null, null);
		} else {
			cb(null, _userid, _token)
		}
	});

};