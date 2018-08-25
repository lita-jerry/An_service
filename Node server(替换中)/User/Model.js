
var SQL = require('../Util/MySQL');

/**
 * 用户模型
 */
module.exports = class Model {

    // ———————————————— 增 ———————————————— //

    /**
     * 添加新用户
     * @param {String} nickname  用户昵称 长度小于32位
     * @param {String} avatarurl 用户头像url 长度小于64位
     * @param {String} mobile 11位手机号
     * @param {(err: String, userid: Number)} callback 回调函数
     */
     static addUser (nickname, avatarurl, mobile, callback) {

        SQL.execute(
            'INSERT INTO user (nick_name, avatar_url, mobile) VALUES(?,?,?)',
            [nickname, avatarurl, mobile],
            function(err, result) {
                if (callback) {
                    callback(err, err ? null : result['insertId']);
                }
            }
        );
    }
    
    /**
     * 添加第三方开放平台账号绑定
     * @param {String} userid 用户id
     * @param {String} openid 第三方平台账号的openid
     * @param {Number} type 1,微信小程序;
     * @param {(err: String)} callback 回调函数
     */
    static addOpenid (userid, openid, type, callback) {

        SQL.execute(
            'INSERT INTO user_bind (user_id, open_id, type) VALUES(?,?,?)',
            [userid, openid, type],
            function(err, result) {
                if (callback) {
                    callback(err);
                }
            }
        );
    }

    // ———————————————— 删 ———————————————— //

    // ———————————————— 改 ———————————————— //

    /**
     * 将用户状态设置为登录
     * @param {Number} userid 
     * @param {String} session 
     * @param {String} session_key 
     * @param {(err: String)} callback 
     */
    static setUserState2Login(userid, session, session_key, callback) {

        // var mysql  = require('mysql');
    
        // var connection = mysql.createConnection(DBConf);
        
        // connection.connect();

        var async = require("async");
        async.waterfall([
            function(_callback){
                //查询是否有该用户登录记录
                var selectSql = 'SELECT * FROM user_online_state WHERE user_id=?';
                var selectSqlParams = [userid];

                SQL.execute(
                    selectSql,
                    selectSqlParams,
                    function(err, result) {
                        _callback(err, result)
                    }
                );
            },
            function(_result, _callback){

                var Sql = '';
                var SqlParams = '';

                if (_result.length > 0) {
                    //如果有则更新登录状态
                    Sql = 'UPDATE user_online_state SET type = 2, client_session = ?, server_session = ? WHERE user_id = ?';
                    SqlParams = [session, session_key, userid];
                } else {
                    //如果没有则添加登录状态
                    Sql = 'INSERT INTO user_online_state(user_id, type, client_session, server_session) VALUES(?,2,?,?)';
                    SqlParams = [userid, session, session_key];
                }

                SQL.execute(
                    Sql,
                    SqlParams,
                    function(err, result) {
                        _callback(err, null);
                    }
                );
            }
        ], function (_err, userid) {
            if (callback) { callback(_err); }
        });
    }
    
    /**
     * 更新用户信息
     * @param {Number} userid 
     * @param {String} nickname 
     * @param {String} avatarurl 
     * @param {(err: string)} callback 
     */
    static updateUserInfo(userid, nickname, avatarurl, callback) {

        SQL.execute(
            'UPDATE user SET nick_name = ?, avatar_url = ? WHERE id = ?',
            [nickname, avatarurl, userid],
            function(err, result) {
                if (callback) {
                    if (err) {
                        callback('数据库出错');
                    } else if (result['changedRows'] > 0) {
                        callback(null);
                    } else {
                        callback('未找到该用户');
                    }
                }
            }
        );
    }

    // ———————————————— 查 ———————————————— //

    /**
     * 获取已绑定第三方开放平台的userid
     * @param {String} openid 第三方开放平台账户id
     * @param {Number} type 第三方开放平台类型: 1,微信小程序;
     * @param {(err: String, userid: Number)} callback 回调函数
     */
    static getUseridOfBind (openid, type, callback) {
        
        SQL.execute(
            'SELECT user_id FROM user_bind WHERE type=? AND open_id=?',
            [type, openid],
            function(err, result) {
                if (callback) {
                    if (err) {
                        callback('[SELECT ERROR] - ' + err.message);
                    } else if (result.length > 0) {
                        callback(null, result[0]['user_id']);
                    } else {
                        callback(null, null); // 查询结果正常,但未查询到结果
                    }
                }
            }
        );
    }

    /**
     * 根据用户登录Session获取用户id
     * @param {String} session 用户登录Session
     * @param {(err: String, userid: String)} callback 回调函数
     */
    static getUseridWithSession (session, callback) {

        SQL.execute(
            'SELECT user_id FROM user_online_state WHERE type=2 AND client_session=?',
            [session],
            function(err, result) {
                if (callback) {
                    if (err) {
                        console.log('[SELECT ERROR] - ',err.message);
                        callback('Database error', null);
                    } else if (result.length > 0) {
                        callback(null, result[0]['user_id']);
                    } else {
                        callback('Session无效', null);
                    }
                }
            }
        );
    }

    /**
     * 根据用户id获取用户信息
     * @param {String} userid 用户id
     * @param {(err: String, nickname: String, avatarURL: String, mobile: String, created: String, lastUpdated: String)} callback 回调函数
     */
    static getUserInfoWithUserid (userid, callback) {

        SQL.execute( 'SELECT * FROM user WHERE id = ?', [userid],
            function(err, result) {
                if (callback) {
                    if (err) {
                        console.log('[SELECT ERROR] - ',err.message);
                        callback('Database error');
                    } else if (result.length > 0) {
                        var item = result[0];
                        callback(null, 
                            item['nick_name'], 
                            item['avatar_url'], 
                            item['mobile'], 
                            item['created_time'], 
                            item['last_updated_time']);
                    } else {
                        callback('无此用户');
                    }
                }
            }
        );
    }
};