
var async = require("async");
var userUtil = require('../../../util/user')

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

/**
 * New client entry.
 *
 * @param  {Object}   msg     request message: login token
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {
  var self = this;
  // var platform = msg.platform;
  
  if (!!session.uid) {
    console.log('user:', session.uid, ' already entered.')
    next(null, {code: 200, error: false, msg: 'already entered.'});
    return;
  }

  // 参数检查
  if (!msg.token) {
    next(null, {code: 200, error: true, msg: '参数错误:缺少token参数'});
    return;
  }

  var token = msg.token;
  var err = false;
  var msg = '';

  // 校验token
  self.app.rpc.user.userRemote.getUserOnlineStateByToken(session, token, function(_err, _hasData, _uid, _platform, _state) {
    if (_err) {
      _cb(_err);
    } else if (!_hasData) {
      err = true;
      msg = 'token无效';
    } else {
      if (_state !== 1) {
        err = true;
        msg = 'token已过期';
      } else {
        err = false;
        msg = 'entry success.'
      }
    }

    // 断开已经登录此号的Session, 绑定uid到新的Session
    var sessionService = self.app.get('sessionService');
    // duplicate log in
    if( !! sessionService.getByUid(_uid)) {
      sessionService.kick(_uid);
    }
    session.bind(_uid);

    next(null, {code: 200, error: err, msg: msg});
  });
};

/**
 * Publish route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.publish = function(msg, session, next) {
  var result = {
    topic: 'publish',
    payload: JSON.stringify({code: 200, msg: 'publish message is ok.'})
  };
  next(null, result);
};

/**
 * Subscribe route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.subscribe = function(msg, session, next) {
  var result = {
    topic: 'subscribe',
    payload: JSON.stringify({code: 200, msg: 'subscribe message is ok.'})
  };
  next(null, result);
};

/**
 * 第三方平台登录
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.loginByOtherPlatform = function(msg, session, next) {
  var self = this;

  // 检查当前用户
  if (!!session.uid) {
    console.log('用户', session.uid, '已经登录, 无需再次登录')
    next(null, {code: 200, error: true, msg: '用户已经登录, 无需再次登录'});
    return;
  }

  // 检查参数
  if (!msg.code) {
    next(null, {code: 200, error: true, msg: '参数错误:缺少code参数'});
    return;
  }
  if (!msg.nickName) {
    next(null, {code: 200, error: true, msg: '参数错误:缺少nickName参数'});
    return;
  }
  if (!msg.avatarURL) {
    next(null, {code: 200, error: true, msg: '参数错误:缺少avatarURL参数'});
    return;
  }

  var code = msg.code;
  var nickName = msg.nickName;
  var avatarURL = msg.avatarURL;

  async.waterfall([
    function (_cb) {
      // 获取openid与session_key
      userUtil.weappJScode2Session(code, function(_err, _openid, _sessionKey){
        if (_err) {
          _cb(_err);
        } else {
          _cb(null, _openid, _sessionKey);
        }
      });
    },
    function(_openid, _sessionKey, _cb) {
      // 查询openid对应的userid
      self.app.rpc.user.userRemote.getUseridByOpenid(session, 1, _openid, function(_err, _hadData, _userid){
        if (_err) {
          _cb(_err);
        } else if (_hadData) {
          _cb(null, _userid, _openid, _sessionKey);
        } else {
          _cb(null, null, _openid, _sessionKey); // 未绑定
        }
      });
    },
    function(_userid, _openid, _sessionKey, _cb) {
      // 如果没有对应的userid,则创建新用户,否则直接跳到下一个处理函数
      if (!_userid) {
        self.app.rpc.user.userRemote.setUser(session, null, nickName, avatarURL, 1, function(_err, _userid){
          if (_err) {
            _cb(_err);
          } else {
            // 需要绑定
            _cb(null, true, _userid, _openid, _sessionKey);
          }
        });
      } else {
        // 已经绑定了
        _cb(null, false, _userid, _openid, _sessionKey);
      }
    },
    function(_needBinding, _userid, _openid, _sessionKey, _cb) {
      // 用户绑定第三方
      if (_needBinding) {
        self.app.rpc.user.userRemote.bindingPlatformForUser(session, _userid, 1, _openid, function(_err){
          if (_err) {
            _cb(_err);
          } else {
            _cb(null, _userid, _sessionKey);
          }
        });
      } else {
        // 不需要绑定
        _cb(null, _userid, _sessionKey);
      }
    },
    function(_userid, _sessionKey, _cb) {
      // 用户登录
      var token = userUtil.makeOnlineSession();
      // 此处的platform设置为1,今后多平台需要改成 platform 变量
      self.app.rpc.user.userRemote.setUserOnlineState(session, _userid, 1, 1, token, _sessionKey, function(_err){
        if (_err) {
          _cb(_err);
        } else {
          _cb(null, _userid, token);
        }
      });
    },
    function(_userid, token, _cb){
      // 断开已经登录此号的Session, 绑定uid到新的Session
      var sessionService = self.app.get('sessionService');
      // duplicate log in
      console.log(_userid, sessionService);
      console.log(sessionService.getByUid(_userid));
      if( !! sessionService.getByUid(_userid)) {
        sessionService.getByUid(_userid).unbind();
      }
      session.bind(_userid);
      _cb(null, token);
    }],
    function (_err, _token) {
      if (!!_err) {
        next(null, {code: 200, error: true, msg: _err});
      } else {
        next(null, {code: 200, error: false, msg: '第三方登录成功', data: {token: _token}});
      }
    });
};

/**
 * 重新登录
 * 
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.relogin = function(msg, session, next) {
  var self = this;
  // var platform = msg.platform;
  
  if (!!session.uid) {
    console.log('用户', session.uid, '已经登录, 无需再次登录')
    next(null, {code: 200, error: true, msg: '用户已经登录, 无需再次登录'});
    return;
  }

  // 参数检查
  if (!msg.token) {
    next(null, {code: 200, error: true, msg: '参数错误:缺少token参数'});
    return;
  }

  var token = msg.token;

  // 恢复登录 ---- start
  async.waterfall([
    function (_cb) {
      // 校验Token
      self.app.rpc.user.userRemote.getUserOnlineStateByToken(session, token, function(_err, _hasData, _uid, _platform, _state) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('Token无效')
        } else {
          if (_state !== 1) {
            _cb('Token已过期');
          } else {
            _cb(null, _uid);
          }
        }
      });
    },
    function (_uid ,_cb) {
      // 生成新Token
      var _token = userUtil.makeOnlineSession();
      // 此处的platform设置为1,今后多平台需要改成 platform 变量
      self.app.rpc.user.userRemote.setUserOnlineState(session, _uid, 1, 1, _token, null, function(_err){
        if (_err) {
          _cb(_err);
        } else {
          _cb(null, _uid, _token);
        }
      });
    },
    function (_uid, _token, _cb) {
      // 断开已经登录此号的Session, 绑定uid到新的Session
      var sessionService = self.app.get('sessionService');
      // duplicate log in
      if( !! sessionService.getByUid(uid)) {
        sessionService.kick(_uid);
      }
      session.bind(uid);
    }], function (_err, _uid, _token) {
      if (!!_err) {
        next(null, {code: 200, error: true, msg: _err});
      } else {
        next(null, {code: 200, error: false, msg: '恢复登录成功', data: {token: _token}});
      }
  });
  // 恢复登录 ---- end
};

/**
 * 进入行程房间
 * 
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry2 = function(msg, session, next) {}