
var async = require("async");
var userUtil = require('../../../util/user')

module.exports = function(app) {
    return new Handler(app);
  };
  
  var Handler = function(app) {
    this.app = app;
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
    next(null, {code: 200, msg: 'game server is ok.'});
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

    if (!!msg.token) {
      // 恢复登录 ---- start
      async.waterfall([
        function (_cb) {
          // 校验Token
          self.app.rpc.user.userRemote.getUseridByToken(session, msg.token, function(_err, _uid, _platform, _state) {
            if (_err) {
              _cb(_err);
            } else {
              if (state !== 1) {
                _cb('Token已过期');
              } else {
                _cb(null, _uid);
              }
            }
          });
        },
        function (_uid ,_cb) {
          // 生成新Token
          var token = userUtil.makeOnlineSession();
          // 此处的platform设置为1,今后多平台需要改成 platform 变量
          self.app.rpc.user.setUserOnlineState(session, _uid, 1, 1, token, null, function(_err){
            if (_err) {
              _cb(_err);
            } else {
              _cb(null, _uid, token);
            }
          });
        },
        function (_uid, _token, _cb) {
          // 断开已经登录此号的Session, 绑定uid到新的Session
          var sessionService = self.app.get('sessionService');
          //duplicate log in
          if( !! sessionService.getByUid(uid)) {
            sessionService.getByUid(uid).unbind();
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
    } else {
      // 下发临时登录Token
      self.app.rpc.user.userRemote.doTempLogin(session, '临时用户', null, 1, 1, function(err, uid, token){
        if (err) {
          next(null, {code: 200, error: true, msg: 'temp login error:'+err});
        } else {
          session.bind(uid);
          next(null, {code: 200, msg: 'temp login success.', token: token});
        }
      });
    }
  };

  /**
   * 临时登录,Token不会过期
   * 
   * @param  {Object}   msg     request message
   * @param  {Object}   session current session object
   * @param  {Function} next    next step callback
   * @return {Void}
   */
  Handler.prototype.tempLogin = function(msg, session, next) {
    var self = this;
    // var platform = msg.platform;
    
    if (!!session.uid) {
      console.log('用户', session.uid, '已经登录, 无需再次登录')
      next(null, {code: 200, error: true, msg: '用户已经登录, 无需再次登录'});
      return;
    }
    
    // 下发临时登录Token
    self.app.rpc.user.userRemote.doTempLogin(session, '临时用户', null, 1, 1, function(err, uid, token){
      if (err) {
        next(null, {code: 200, error: true, msg: 'temp login error:'+err});
      } else {
        session.bind(uid);
        next(null, {code: 200, msg: 'temp login success.', token: token});
      }
    });
  };