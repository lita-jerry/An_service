module.exports = function(app) {
    return new Handler(app);
  };
  
  var Handler = function(app) {
    this.app = app;
  };
  
  /**
   * 获取临时登录Token
   *
   * @param  {Object}   msg     request message
   * @param  {Object}   session current session object
   * @param  {Function} next    next step callback
   * @return {Void}
   */
  Handler.prototype.getTempToken = function(msg, session, next) {
    next(null, {code: 200, msg: 'game server is ok.'});
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
