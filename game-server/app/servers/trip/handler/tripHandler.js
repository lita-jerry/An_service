
var async = require("async");
var userUtil = require('../../../util/user')

module.exports = function(app) {
  return new Handler(app);
};
  
var Handler = function(app) {
  this.app = app;
  this.channelService = app.get('channelService');
  this.backendSessionService = app.get('backendSessionService');
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
  
  // 检查参数
  if (!msg.token) {
    next(null, { code: 200, error: true, msg: '参数错误:缺少token参数'});
    return;
  }

  var token = msg.token;

  async.waterfall([
    function(_cb) {
      self.app.rpc.user.userRemote.getUserOnlineStateByToken(session, token, function(_err, _hasData, _uid, _platform, _state) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('token无效');
        } else if (_state !== 1) {
          _cb('token已过期');
        } else {
          _cb(null, _uid);
        }
      });
    },
    function(_uid, _cb) {
      self.app.rpc.trip.tripRemote.queryUnfinished(session, _uid, function(_err, _hasData, _ordernumber) {
        if (!!_err) {
          _cb(_err);
        } else {
          _cb(null, _ordernumber);
        }
      });
    }],
    function(_err, _ordernumber) {
      if (!!_err) {
        next(null, { code: 200, error: true, msg: _err});
      } else {
        next(null, { code: 200, error: false, msg: !!_ordernumber ? '有未完成行程' : '当前无行程', data: {ordernumber: _ordernumber}});
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
  
  // 检查参数
  if (!msg.token) {
    next(null, { code: 200, error: true, msg: '参数错误:缺少token参数'});
    return;
  }

  var token = msg.token;

  async.waterfall([
    function(_cb) {
      self.app.rpc.user.userRemote.getUserOnlineStateByToken(session, token, function(_err, _hasData, _uid, _platform, _state) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('token无效');
        } else if (_state !== 1) {
          _cb('token已过期');
        } else {
          _cb(null, _uid);
        }
      });
    },
    function(_uid, _cb) {
      // 查询是否有未完成的行程
      self.app.rpc.trip.tripRemote.queryUnfinished(session, _uid, function(_err, _hasData, _ordernumber) {
        if (_err) {
          _cb(_err);
        } else if (_hasData) {
          _cb('has unfinished.');
        } else {
          _cb(null, _uid);
        }
      });
    },
    function(_uid, _cb) {
      // 创建订单
      self.app.rpc.trip.tripRemote.create(session, _uid, function(_err, _ordernumber) {
        if (_err) {
          _cb(_err);
        } else {
          _cb(null, _ordernumber);
        }
      });
    }
  ],function(_err, _ordernumber) {
    if (_err) {
      next(null, { code: 200, error: true, msg: _err});
    } else {
      next(null, { code: 200, error: false, msg: '行程创建成功', data:{ordernumber: _ordernumber}});
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
    next(null, { code: 200, error: true, msg: 'user not entered.'});
    return;
  }

  // 检查参数
  // if (!msg.ordernumber) {
  //   next(null, { code: 200, error: true, msg: '参数错误:缺少ordernumber参数'});
  //   return;
  // }
  // 其实一开始考虑上传ordernumber,后来觉得既然在房间内,就可以获取,所以采用下面的方法,更安全

  if (!session.get('rid')) {
    next(null, { code: 200, error: true, msg: 'user not in trip room.'});
    return;
  }

  var uid = session.uid;
  var rid = session.get('rid');

  async.waterfall([
    function(_cb) {
      // 检查行程信息(当前状态、所属uid)
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
      next(null, { code: 200, error: true, msg: _err});
    } else {
      // channel内成员rid清除
      /* 是真特么清除不了啊，BackendSession.prototype.set() 并不能调用
      var channel = self.channelService.getChannel(rid, false);
      if (!!channel) {
        console.log('.......', channel);
        for (var _index in channel.records) {
          console.log('这里是:', channel.records[_index]);
          var _sid = channel.records[_index]['sid'];
          var _uid = channel.records[_index]['uid'];
          self.backendSessionService.getByUid(_sid, _uid, function(__err, __session) {
            if (!__err) {
              console.log('__session:', __session);
              // __session.set('rid', null);
              console.log('这里能获取到吗？', __session.get('rid'));
              __session.push('rid', function(err) {
                if(err) {
                  console.error('entryHandler.leaveTripRoom: set rid for session service failed! error is : %j', err.stack);
                }
              });
            }
          });
        }
      }
      */
      // 发出通知
      var channel = self.channelService.getChannel(rid, false);
      if (!!channel) {
        channel.pushMessage({
          route: 'onEnd'
        })
      }
      // 销毁channel
      self.channelService.destroyChannel(rid);
      
      next(null, { code: 200, error: false, msg: 'end trip success.'});
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
    next(null, { code: 200, error: true, msg: 'user not entered.'});
    return;
  }

  if (!session.get('rid')) {
    next(null, { code: 200, error: true, msg: 'user not in trip room.'});
    return;
  }

  // 检查参数
  if (!msg.longitude) { // 经度
    next(null, { code: 200, error: true, msg: '参数错误:缺少longitude参数'});
    return;
  }

  if (!msg.latitude) { // 纬度
    next(null, { code: 200, error: true, msg: '参数错误:缺少latitude参数'});
    return;
  }

  var uid = session.uid;
  var rid = session.get('rid');
  var longitude = msg.longitude;
  var latitude = msg.latitude;

  async.waterfall([
    function(_cb) {
      // 检查行程信息(当前状态、所属uid)
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
    next(null, { code: 200, error: !!_err, msg: _err ? _err : 'upload trip location success.'});
  });
}

/**
 * 行程求助
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
Handler.prototype.SOS = function(msg, session, next) {
  var self = this;
  
  if (!session.uid) {
    next(null, { code: 200, error: true, msg: 'user not entered.'});
    return;
  }

  if (!session.get('rid')) {
    next(null, { code: 200, error: true, msg: 'user not in trip room.'});
    return;
  }

  var uid = session.uid;
  var rid = session.get('rid');

  async.waterfall([
    function(_cb) {
      // 检查行程信息(当前状态、所属uid)
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
      // 记录日志
      self.app.rpc.trip.tripRemote.addLog(session, rid, 1, '发出求救', null, function(_err) {
        if (_err) {
          console.error('entryHandler.SOS: add log failed! error is : %j', _err.stack);
        }
        _cb(); // 这里没想好怎么做错误处理,不管记录没记录都先发通知吧
      });
    },
    function(_cb) {
      // 发出通知
      _cb();
    }
  ], function(_err) {
    next(null, { code: 200, error: !!_err, msg: _err ? _err : 'SOS message send.'});
  });
}

/**
 * 关注房主
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
Handler.prototype.follow = function(msg, session, next) {
  var self = this;
  
  if (!session.uid) {
    next(null, { code: 200, error: true, msg: 'user not entered.'});
    return;
  }

  if (!session.get('rid')) {
    next(null, { code: 200, error: true, msg: 'user not in trip room.'});
    return;
  }

  var uid = session.uid;
  var rid = session.get('rid');

  async.waterfall([
    function(_cb) {
      // 检查行程信息(所属uid)
      self.app.rpc.trip.tripRemote.getInfo(session, rid, function(_err, _hasData, _uid, _state) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('无此行程');
        } else if (_uid === uid) {
          _cb('不能关注自己');
        } else {
          _cb(null, _uid);
        }
      });
    },
    function(_uid, _cb) {
      // 查询当前关注状态
      self.app,rpc.trip.tripRemote.getFollowState(session, _uid, uid, function(_err, _isSure) {
        if (_err) {
          _cb(_err);
        } else if (_isSure) {
          _cb('已经关注过了');
        } else {
          _cb(null, _uid);
        }
      });
    },
    function(_uid, _cb) {
      // 添加关注绑定
      self.app.rpc.trip.tripRemote.addFollower(session, _uid, uid, function(_err) {
        _cb(_err);
      });
    },
    function(_cb) {
      // 发出通知 稍后完成
      _cb();
    }
  ], function(_err) {
    next(null, { code: 200, error: !!_err, msg: _err ? _err : 'SOS message send.'});
  });
}

/**
 * 取消关注房主
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
Handler.prototype.unfollow = function(msg, session, next) {
  var self = this;
  
  if (!session.uid) {
    next(null, { code: 200, error: true, msg: 'user not entered.'});
    return;
  }

  if (!session.get('rid')) {
    next(null, { code: 200, error: true, msg: 'user not in trip room.'});
    return;
  }

  var uid = session.uid;
  var rid = session.get('rid');

  async.waterfall([
    function(_cb) {
      // 检查行程信息(所属uid)
      self.app.rpc.trip.tripRemote.getInfo(session, rid, function(_err, _hasData, _uid, _state) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('无此行程');
        } else if (_uid === uid) {
          _cb('不能关注自己');
        } else {
          _cb(null, _uid);
        }
      });
    },
    function(_uid, _cb) {
      // 查询当前关注状态
      self.app,rpc.trip.tripRemote.getFollowState(session, _uid, uid, function(_err, _isSure) {
        if (_err) {
          _cb(_err);
        } else if (_isSure) {
          _cb(null, _uid);
        } else {
          _cb('还未关注');
        }
      });
    },
    function(_uid, _cb) {
      // 删除关注绑定的关系
      self.app.rpc.trip.tripRemote.deleteFollower(session, _uid, uid, function(_err) {
        _cb(_err);
      });
    },
    function(_cb) {
      // 发出通知 稍后完成
      _cb();
    }
  ], function(_err) {
    next(null, { code: 200, error: !!_err, msg: _err ? _err : 'SOS message send.'});
  });
}

/**
 * 获取行程信息、状态及最后出现的位置
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
Handler.prototype.getInfo = function(msg, session, next) {
  var self = this;

  // 检查参数
  if (!msg.token) {
    next(null, { code: 200, error: true, msg: '参数错误:缺少token参数'});
    return;
  }

  if (!msg.ordernumber) {
    next(null, { code: 200, error: true, msg: '参数错误:缺少ordernumber参数'});
    return;
  }

  var token = msg.token;
  var rid = msg.ordernumber;

  async.waterfall([
    function(_cb) {
      // 查询行程信息
      self.app.rpc.trip.tripRemote.getInfo(session, rid, function(_err, _hasData, _uid, _state, _createdTime, _lastUpdatedTime) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('无此行程');
        } else {
          _cb(null, _uid, _state, _createdTime, _lastUpdatedTime);
        }
      });
    },
    function(_creatorid, _state, _createdTime, _lastUpdatedTime, _cb) {
      // 获取行程所属用户的用户信息
      self.app.rpc.user.userRemote.getInfo(session, _creatorid, function(_err, _hasData, _nickName, _avatar) {
        if (!!_err) {
          cb(_err);
        } else if (!_hasData) {
          cb('用户查询失败');
        } else {
          _cb(null, _creatorid, _nickName, _avatar, _state, _createdTime, _lastUpdatedTime);
        }
      });
    },
    function(_creatorid, _nickName, _avatar, _state, _createdTime, _lastUpdatedTime, _cb) {
      // 获取请求者的用户id,为了判断是否为该行程的所有者
      self.app.rpc.user.userRemote.getUserOnlineStateByToken(session, token, function(_err, _hasData, _uid, _platform, _state) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('token无效');
        } else if (_state !== 1) {
          _cb('token已过期');
        } else {
          _cb(null, _creatorid, _nickName, _avatar, _state, _createdTime, _lastUpdatedTime, _creatorid === _uid);
        }
      });
    },
    function(_creatorid, _nickName, _avatar, _state, _createdTime, _lastUpdatedTime, _isCreator, _cb) {
      // 获取最后位置
      self.app.rpc.trip.tripRemote.getLastPlace(session, rid, function(_err, _hasData, _longitude, _latitude, _remark, _time) {
        if (!!_err) {
          _cb(_err);
        } else {
          var lastPlace = {
            longitude: _longitude,
            latitude: _latitude,
            remark: _remark,
            time: _time
          }
          _cb(null, _creatorid, _nickName, _avatar, _state, _createdTime, _lastUpdatedTime, lastPlace, _isCreator);
        }
      });
    }], 
    function(_err, _creatorid, _nickName, _avatar, _state, _createdTime, _lastUpdatedTime, _lastPlace, _isCreator) {
    if (!!_err) {
      next(null, { code: 200, error: true, msg: _err});
    } else {
      next(null, { code: 200, error: false, msg: '行程信息获取成功', data: {
        creatorid: _creatorid,
        nickName: _nickName,
        avatar: _avatar,
        tripState: _state,
        createdTime: _createdTime,
        lastUpdatedTime: _lastUpdatedTime,
        lastPlace: _lastPlace,
        isCreator: _isCreator
      }});
    }
  });
}

/**
 * 获取行程路线
 * 
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next stemp callback
 */
Handler.prototype.getPolyline = function(msg, session, next) {
  var self = this;

  // 检查参数
  if (!msg.token) {
    next(null, { code: 200, error: true, msg: '参数错误:缺少token参数'});
    return;
  }

  if (!msg.ordernumber) {
    next(null, { code: 200, error: true, msg: '参数错误:缺少ordernumber参数'});
    return;
  }

  if (msg.page !== 0 && !msg.page) {
    next(null, { code: 200, error: true, msg: '参数错误:缺少page参数'});
    return;
  }

  var token = msg.token;
  var rid = msg.ordernumber;
  var page = msg.page;

  async.waterfall([
    function(_cb) {
      self.app.rpc.user.userRemote.getUserOnlineStateByToken(session, token, function(_err, _hasData, _uid, _platform, _state) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('token无效');
        } else if (_state !== 1) {
          _cb('token已过期');
        } else {
          _cb(null);
        }
      });
    },
    function(_cb) {
      // 查询行程信息
      self.app.rpc.trip.tripRemote.getInfo(session, rid, function(_err, _hasData, _uid, _state, _createdTime, _lastUpdatedTime) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('无此行程');
        } else {
          _cb(null);
        }
      });
    },
    function(_cb) {
      // 获取路线
      self.app.rpc.trip.tripRemote.getPolyline(session, rid, page * 20, 20, function(_err, _polyline) {
        if (_err) {
          _cb(_err);
        } else {
          _cb(null, _polyline);
        }
      });
    }
  ], function(_err, _polyline) {
    if (!!_err) {
      next(null, { code: 200, error: true, msg: _err});
    } else {
      next(null, { code: 200, error: false, msg: '行程路线获取成功', data: _polyline});
    }
  });
}

/**
 * 获取行程房间内的用户信息
 * 
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next stemp callback
 */
Handler.prototype.getUserInfoInTripRoom = function(msg, session, next) {
  var self = this;

  if (!session.get('rid')) {
    next(null, { code: 200, error: true, msg: 'user not in trip room.'});
    return;
  }

  var rid = session.get('rid');

  async.waterfall([
    function(_cb) {
      // 检查行程信息(当前状态、所属uid)
      self.app.rpc.trip.tripRemote.getInfo(session, rid, function(_err, _hasData, _uid, _state) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('无此行程');
        } else if (_state === 2) {
          _cb('行程已经结束');
        } else {
          _cb(null, _uid);
        }
      });
    },
    function(_uid, _cb) {
      // 获取room内成员
      self.app.rpc.trip.tripRemote.getUsersInRoom(session, rid, function(_err, _userList) {
        // 去除房主 (犹豫要不要去除查询的本人,即 uid)
        var _uidList = _userList.map((currentValue, index, arr) => {
          return currentValue['uid'];
        });
        if (_uidList.length > 0) {
          var _index = _uidList.indexOf(''+_uid);
          if (_index !== -1) {
            _userList.splice(_index, 1);
          }
        }

        _cb(null, _userList.map((currentValue, index, arr) => {
          return {
            nickName: currentValue['nickName'],
            avatar: currentValue['avatar']
          };
        }));
      });
      
    }], function(_err, _data) {
      if (!!_err) {
        next(null, { code: 200, error: true, msg: _err});
      } else {
        next(null, { code: 200, error: false, msg: '获取用户信息成功', data: _data});
      }
  });
}