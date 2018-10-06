var async = require("async");
var userUtil = require('../../../util/user')

module.exports = function(app) {
  return new Handler(app);
};
  
var Handler = function(app) {
  this.app = app;
};

/**
 * 检查登录Token是否合法、未过期
 * 
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
Handler.prototype.checkLoginToken = function(msg, session, next) {
  var self = this;
  
  // 参数检查
  if (!msg.token) {
    next(null, { code: 200, error: true, msg: '参数错误:缺少token参数'});
    return;
  }

  var token = msg.token;

  this.app.rpc.user.userRemote.getUserOnlineStateByToken(session, token, function(_err, _hasData, _uid, _platform, _state) {

    var hasError = false;
    var errMsg = 'Token生效且未过期'

    if (_err) {
      hasError = true;
      errMsg = _err;
    } else if (!_hasData) {
      hasError = true;
      errMsg = 'token无效';
    } else if (_state !== 1) {
      hasError = true;
      errMsg = 'token已过期';
    } else {
      // Token生效且未过期
    }

    next(null, { code: 200, error: hasError, msg: errMsg});
  });
}

/**
 * 微信小程序登录
 * 
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
Handler.prototype.loginByWeapp = function(msg, session, next) {
  var self = this;
  
  // 检查参数
  if (!msg.code) {
    next(null, { code: 200, error: true, msg: '参数错误:缺少code参数'});
    return;
  }
  if (!msg.nickName) {
    next(null, { code: 200, error: true, msg: '参数错误:缺少nickName参数'});
    return;
  }
  if (!msg.avatarURL) {
    next(null, { code: 200, error: true, msg: '参数错误:缺少avatarURL参数'});
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
      self.app.rpc.user.userRemote.getUseridByOpenid(session, 1, _openid, function(_err, _hadData, _uid){
        if (_err) {
          _cb(_err);
        } else if (_hadData) {
          _cb(null, _uid, _openid, _sessionKey);
        } else {
          _cb(null, null, _openid, _sessionKey); // 未绑定
        }
      });
    },
    function(_uid, _openid, _sessionKey, _cb) {
      // 如果没有对应的userid,则创建新用户,否则直接跳到下一个处理函数
      if (!_uid) {
        self.app.rpc.user.userRemote.setUser(session, null, nickName, avatarURL, 1, function(_err, _uid){
          if (_err) {
            _cb(_err);
          } else {
            // 需要绑定
            _cb(null, true, _uid, _openid, _sessionKey);
          }
        });
      } else {
        // 已经绑定了
        _cb(null, false, _uid, _openid, _sessionKey);
      }
    },
    function(_needBinding, _uid, _openid, _sessionKey, _cb) {
      // 用户绑定第三方
      if (_needBinding) {
        self.app.rpc.user.userRemote.bindingPlatformForUser(session, _uid, 1, _openid, function(_err){
          if (_err) {
            _cb(_err);
          } else {
            _cb(null, _uid, _sessionKey);
          }
        });
      } else {
        // 不需要绑定
        _cb(null, _uid, _sessionKey);
      }
    },
    function(_uid, _sessionKey, _cb) {
      // 用户登录
      var token = userUtil.makeOnlineSession();
      // platform设置为1,表示为微信小程序
      self.app.rpc.user.userRemote.setUserOnlineState(session, _uid, 1, 1, token, _sessionKey, null, null, function(_err){
        if (_err) {
          _cb(_err);
        } else {
          _cb(null, _uid, token);
        }
      });
    }],
    function (_err, _uid, _token) {
      if (!!_err) {
        next(null, { code: 200, error: true, msg: _err});
      } else {
        next(null, { code: 200, error: false, msg: '微信小程序登录成功', data: {token: _token}});
      }
    });
}

