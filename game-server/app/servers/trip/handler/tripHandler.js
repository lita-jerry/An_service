
var async = require("async");
var userUtil = require('../../../util/user')

module.exports = function(app) {
  return new Handler(app);
};
  
var Handler = function(app) {
  this.app = app;
  this.channelService = app.get('channelService');
};

/**
 * 查询未完成的行程
 * 
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
Handler.prototype.queryUnfinished = function(msg, session, next) {
  var self = this;
  
  if (!session.uid) {
    next(null, {error: true, msg: 'user not entered.'});
    return;
  }

  var uid = session.uid;

  this.app.rpc.trip.tripRemote.queryUnfinished(session, uid, function(_err, _hasData, _ordernumber) {
    if (_err) {
      next(null, {error: true, msg: _err});
    } else if (!_hasData) {
      next(null, {error: false, msg: 'no trip.'});
    } else {
      next(null, {error: false, msg: 'has unfinished trip.', data: {ordernumber: _ordernumber}});
    }
  });
}

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
    next(null, {error: true, msg: 'user not entered.'});
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
      next(null, {error: true, msg: _err});
    } else {
      next(null, {error: false, msg: '行程创建成功', data:{ordernumber: _ordernumber}});
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
Handler.prototype.end = function(msg, session, next) {
  var self = this;
  
  if (!session.uid) {
    next(null, {error: true, msg: 'user not entered.'});
    return;
  }

  // 检查参数
  // if (!msg.ordernumber) {
  //   next(null, {error: true, msg: '参数错误:缺少ordernumber参数'});
  //   return;
  // }
  // 其实一开始考虑上传ordernumber,后来觉得既然在房间内,就可以获取,所以采用下面的方法,更安全

  if (!session.get('rid')) {
    next(null, {error: true, msg: 'user not in trip room.'});
    return;
  }

  var uid = session.uid;
  var rid = session.get('rid');

  async.waterfall([
    function(_cb) {
      // 检查行程信息(当前状态、所属id)
      self.app.rpc.trip.tripRemote.getInfo(session, rid, function(_err, _hasData, _uid, _state) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('无此行程');
        } else if (_uid !== uid) {
          _cb('无权操作');
        } else if (_state !== 1) {
          // 不在进行中
          _cb('无效操作');
        } else {
          _cb();
        }
      });
    },
    function(_cb) {
      // 结束行程
      self.app.rpc.trip.tripRemote.end(session, rid, function(_err) {
        _cb(!!_err ? _err : null);
      });
    }
  ], function(_err) {
    if (_err) {
      next(null, {error: true, msg: _err});
    } else {
      self.channelService.destroyChannel(rid);
      next(null, {error: false, msg: 'end trip success.'});
    }
  });
}

/**
 * 上报当前位置
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
Handler.prototype.uploadLocation = function(msg, session, next) {
  var self = this;
  
  if (!session.uid) {
    next(null, {error: true, msg: 'user not entered.'});
    return;
  }

  if (!session.get('rid')) {
    next(null, {error: true, msg: 'user not in trip room.'});
    return;
  }

  // 检查参数
  if (!msg.longitude) { // 经度
    next(null, {error: true, msg: '参数错误:缺少longitude参数'});
    return;
  }

  if (!msg.latitude) { // 纬度
    next(null, {error: true, msg: '参数错误:缺少latitude参数'});
    return;
  }

  var uid = session.uid;
  var rid = session.get('rid');
  var longitude = msg.longitude;
  var latitude = msg.latitude;

  async.waterfall([
    function(_cb) {
      // 检查行程信息(当前状态、所属id)
      self.app.rpc.trip.tripRemote.getInfo(session, rid, function(_err, _hasData, _uid, _state) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('无此行程');
        } else if (_uid !== uid) {
          _cb('无权操作');
        } else if (_state !== 1) {
          // 不在进行中
          _cb('无效操作');
        } else {
          _cb();
        }
      });
    },
    function(_cb) {
      // 添加位置记录
      self.app.rpc.trip.tripRemote.uploadLocation(session, rid, longitude, latitude, null, function(_err) {
        _cb(_err);
      });
    }
  ], function(_err) {
    next(null, {error: !!_err, msg: _err ? _err : 'upload trip location success.'});
  });
}

/**
 * 获取行程信息(时间、日志、轨迹)
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
Handler.prototype.get = function(msg, session, next) {}

/**
 * 获取行程房间内的用户信息
 * 
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 */
Handler.prototype.getUserInfoInTripRoom = function(msg, session, next) {
  // 检查用户id
  // 检查是否在房间内
  // var list = [1, 2];
  // var sql = 'SELECT * FROM user WHERE id in (' + list + ')'
  // console.log('SQL语句是:'+sql);
  // mysql.execute(sql, [], function(err, result){
  //   console.log(err, result);
  // });
}