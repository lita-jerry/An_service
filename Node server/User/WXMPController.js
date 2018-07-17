
var UserModel = require('./Model');
var Util = require('./util');

/**
 * 微信小程序用户注册
 * @param {String} code 
 * @param {String} nickname 
 * @param {String} avatarurl 
 * @param {(err: {code: Number, msg: String}, session: String)} callback 回调函数
 */
var regist = function(code, nickname, avatarurl, callback) {

    var hasUser = false;
    var openid, session_key, openid;

    var async = require("async");

    async.waterfall([
        function(_callback){
            // 获取微信openid
            Util.getWXMPSession(code, (err, _openid, _session_key) => {
                if (err) {
                    _callback(9001, '微信服务器出错');
                } else {
                    openid = _openid;
                    session_key = _session_key;
                    _callback();
                }
            });
        },
        function(_callback){
            // 根据openid查询用户是否已经注册过
            UserModel.getUseridOfBind(openid, 1, (err, _userid) => {
                if (err) {
                    _callback(9002, '查询用户绑定时出错');
                } else { 
                    if (_userid !== null) {
                        // 这边考虑已注册的用户直接返回登录状态,以免多次请求
                        userid = _userid;
                        hasUser = true;
                    }
                    _callback();
                }
            });
        },
        function(_callback){
            // 注册新用户
            if (hasUser) { // 跳过注册
                _callback();
            } else {
                UserModel.addUser(nickname, avatarurl, null, (err, _userid) => {
                    if (err) {
                        _callback(9003, '注册用户时出错');
                    } else {
                        userid = _userid;
                        _callback();
                    }
                });
            }
            
        },
        function(_callback){
            // 绑定第三方登录方式
            if (hasUser) { // 跳过绑定第三方登录方式
                _callback();
            } else {
                UserModel.addOpenid(userid, openid, 1, (err) => {
                    if (err) {
                        _callback(9004, '绑定第三方登录方式时出错');
                    } else {
                        _callback();
                    }
                });
            }
        },
        function(_callback){
            // 更新登录状态
            var session = Util.makeOnlineSession();
            UserModel.setUserState2Login(userid, session, session_key, (err) => {
                if (err) {
                    _callback(9005, '更新登录状态出错');
                } else {
                    _callback(null, session);
                }
            });
        }
    ], function (err, result) {
        if (callback) {
            if (err) {
                callback({code: err, msg: result}, null);
            } else {
                callback(null, result);
            }
        }
    });
}

/**
 * 微信小程序用户登录
 * @param {String} code 
 * @param {(err: {code: Number, msg: String}, session: String)} callback 
 */
var login = function(code, callback) {

    var async = require("async");

    async.waterfall([
        function(_callback){
            // 获取微信openid、session_key
            Util.getWXMPSession(code, (err, openid, session_key) => {
                if (err) {
                    _callback(9001, '微信服务器出错');
                } else {
                    _callback(null, openid, session_key);
                }
            });
        },
        function(openid, session_key, _callback){
            // 根据openid查询用户是否已经注册过
            UserModel.getUseridOfBind(openid, 1, (err, userid) => {
                if (err) {
                    _callback(9002, '查询用户绑定时出错');
                } else if (userid === null) {
                    _callback(9003, '用户未注册');
                } else {
                    _callback(null, userid, session_key);
                }
            });
        },
        function(userid, session_key, _callback){
            // 更新登录状态
            var session = Util.makeOnlineSession();
            UserModel.setUserState2Login(userid, session, session_key, (err) => {
                if (err) {
                    _callback(9004, '更新登录状态出错');
                } else {
                    _callback(null, session);
                }
            });
        }
    ], function (err, result) {
        if (callback) {
            if (err) {
                callback({code: err, msg: result}, null);
            } else {
                callback(null, result);
            }
        }
    });
}

/**
 * 微信小程序用户信息更新
 * @param {String} session 
 * @param {String} nickname 
 * @param {String} avatarurl 
 * @param {(err: {code: Number, msg: String})} callback 
 */
var infoUpdate = function(session, nickname, avatarurl, callback) {
    var async = require("async");

    async.waterfall([
        function(_callback){
            // 获取userid
            UserModel.getUseridWithSession(session, (err, userid) => {
                if (err) {
                    _callback(9001, 'Session无效');
                } else {
                    _callback(null, userid);
                }
            });
        },
        function(userid, _callback){
            // 更新数据
            UserModel.updateUserInfo(userid, nickname, avatarurl, (err) => {
                if (err) {
                    _callback(9002, '更新数据时出错');
                } else {
                    _callback(null);
                }
            });
        }
    ], function (err, result) {
        if (callback) {
            if (err) {
                callback({code: err, msg: result});
            } else {
                callback(null);
            }
        }
    });
}

exports.regist = regist;
exports.login = login;
exports.infoUpdate = infoUpdate;