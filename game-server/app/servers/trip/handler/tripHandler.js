
var async = require("async");
var userUtil = require('../../../util/user')

module.exports = function(app) {
  return new Handler(app);
};
  
var Handler = function(app) {
  this.app = app;
};

/**
 * 查询未完成的行程
 * 
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
Handler.prototype.queryUnfinished = function(msg, session, next) {}

/**
 * 创建行程
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
Handler.prototype.create = function(msg, session, next) {
  var self = this;
  
  if (!session.uid) {
    next(null, {code: 200, error: true, msg: 'user not entered.'});
    return;
  }

  var uid = session.uid;

  async.waterfall([
    function(_cb) {
      // 查询是否有未完成的行程
      self.app.rpc.trip.tripRemote.queryUnfinished(session, uid, function(_err, _hasData, _ordernumber) {
        if (_err) {
          _cb(_err);
        } else if (_hasData) {
          _cb('has unfinished.');
        } else {
          _cb(null);
        }
      });
    },
    function(_cb) {
      // 创建订单
      self.app.rpc.trip.tripRemote.create(session, uid, function(_err, _ordernumber) {
        if (_err) {
          _cb(_err);
        } else {
          _cb(null, _ordernumber);
        }
      });
    }
  ],function(_err, _ordernumber) {
    if (_err) {
      next(null, {code: 200, error: true, msg: _err});
    } else {
      next(null, {code: 200, error: true, msg: '行程创建成功', data:{ordernumber: _ordernumber}});
    }
  });
}

/**
 * 结束行程
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
Handler.prototype.end = function(msg, session, next) {}

/**
 * 上报当前位置
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
Handler.prototype.uploadLocation = function(msg, session, next) {}

/**
 * 获取行程信息(时间、日志、轨迹)
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
Handler.prototype.get = function(msg, session, next) {}
