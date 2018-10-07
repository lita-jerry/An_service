
var async = require("async");
var userUtil = require('../../../util/user')

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

/**
 * 进入Tripping房间(房主模式)
 * 
 * @param {*} msg 
 * @param {*} session 
 * @param {*} next 
 */
Handler.prototype.entryTrippingRoom = function(msg, session, next) {
  // 检查当前状态
  if (!!session.uid || !!session.rid) {
    next(null, { code: 200, error: true, msg: '用户已经进入某个行程房间内'});
    return;
  }

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
  var rid = msg.ordernumber; // room id 就是行程订单号

  var self = this;

  async.waterfall([
    function(_cb) {
      // 检查Token
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
      // 查询行程订单状态
      self.app.rpc.trip.tripRemote.getInfo(session, rid, function(_err, _hasData, _creator, _state) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('无此行程');
        } else if (_state === 2) {
          _cb('行程已结束');
        } else if (_uid !== _creator) { // 是否为行程创建者
          _cb('非行程创建者');
        } else {
          _cb(null, _uid);
        }
			});
    },
    function(_uid, _cb) {
      // 获取用户信息
      self.app.rpc.user.userRemote.getInfo(session, _uid, function(_err, _hasData, _nickName, _avatar) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('无效用户');
        } else {
          _cb(null, _uid, _nickName, _avatar);
        }
      });
    },
    function(_uid, _nickName, _avatar, _cb) {
      // 断开已经登录此号的Session, 绑定uid到新的Session
      var sessionService = self.app.get('sessionService');
      // duplicate log in
      if( !! sessionService.getByUid(_uid)) {
        sessionService.kick(_uid);
      }

      session.bind(_uid);
      session.set('nickName', _nickName);
      session.set('avatar', _avatar);

      session.set('rid', rid);

      session.pushAll(function(err) {
        if(err) {
          console.error('set variable for session service failed! error is : %j', err.stack);
        }
      });

      session.on('closed', onTripCreatorDissconnect.bind(null, self.app));

      //put user into channel
      self.app.rpc.trip.tripRemote.tripCreatorAdd(session, _uid, self.app.get('serverId'), rid, _nickName, _avatar, function(_err){
        _cb(_err);
      });
    }
  ],
  function(_err) {
    if (_err) {
      next(null, { code: 200, error: true, msg: _err});
    } else {
      next(null, { code: 200, error: false, msg: '进入行程房间成功(房主模式)'});
    }
  });
}

/**
 * 房主断开连接
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onTripCreatorDissconnect = function(app, session) {
  if(!!session && !!session.uid) {
    self.app.rpc.trip.tripRemote.tripCreatorLeave(session, session.uid, app.get('serverId'), session.get('rid'), session.get('nickName'), session.get('avatar'), ()=>{});
    return;
  }
};

/**
 * 进入Watching房间(观察者模式)
 * 
 * @param {*} msg 
 * @param {*} session 
 * @param {*} next 
 */
Handler.prototype.entryWatchingRoom = function(msg, session, next) {
  // 检查当前状态
  if (!!session.uid || !!session.rid) {
    next(null, { code: 200, error: true, msg: '用户已经进入某个行程房间内'});
    return;
  }

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
  var rid = msg.ordernumber; // room id 就是行程订单号

  var self = this;

  async.waterfall([
    function(_cb) {
      // 检查Token
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
      // 查询行程订单状态
      self.app.rpc.trip.tripRemote.getInfo(session, rid, function(_err, _hasData, _creator, _state) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('无此行程');
        } else if (_state === 2) {
          _cb('行程已结束');
        } else if (_uid === _creator) { // 是否为行程创建者
          _cb('行程创建者,不能使用该方法');
        } else {
          _cb(null, _uid);
        }
			});
    },
    function(_uid, _cb) {
      // 获取用户信息
      self.app.rpc.user.userRemote.getInfo(session, _uid, function(_err, _hasData, _nickName, _avatar) {
        if (_err) {
          _cb(_err);
        } else if (!_hasData) {
          _cb('无效用户');
        } else {
          _cb(null, _uid, _nickName, _avatar);
        }
      });
    },
    function(_uid, _nickName, _avatar, _cb) {
      // 断开已经登录此号的Session, 绑定uid到新的Session
      var sessionService = self.app.get('sessionService');
      // duplicate log in
      if( !! sessionService.getByUid(_uid)) {
        sessionService.kick(_uid);
      }

      session.bind(_uid);
      session.set('nickName', _nickName);
      session.set('avatar', _avatar);

      session.set('rid', rid);

      session.pushAll(function(err) {
        if(err) {
          console.error('set variable for session service failed! error is : %j', err.stack);
        }
      });

      session.on('closed', onTripWatcherDissconnect.bind(null, self.app));

      //put user into channel
      self.app.rpc.trip.tripRemote.tripWatcherAdd(session, uid, self.app.get('serverId'), rid, _nickName, _avatar, function(_err){
        _cb(_err);
      });
    }
  ],
  function(_err) {
    if (_err) {
      next(null, { code: 200, error: true, msg: _err});
    } else {
      next(null, { code: 200, error: false, msg: '进入行程房间成功(观察者模式)'});
    }
  });
}

/**
 * 观察者断开连接
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onTripWatcherDissconnect = function(app, session) {
  if(!!session && !!session.uid) {
    self.app.rpc.trip.tripRemote.tripWatcherLeave(session, session.uid, app.get('serverId'), session.get('rid'), session.get('nickName'), session.get('avatar'), ()=>{});
    return;
  }
};

/**
 * 离开行程房间(只限于观察者使用该方法)) 作废
 * 
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.leaveTripRoom = function(msg, session, next) {
  var self = this;
  
  if (!session.uid) {
    next(null, { code: 200, error: true, msg: 'user not entered.'});
    return;
  }

  // 参数检查
  if (!session.get('rid')) {
    next(null, { code: 200, error: true, msg: '未在房间内'});
    return;
  }

  var uid = session.uid;
  var sid = this.app.get('serverId');
  var rid = session.get('rid'); // room id

  session.set('rid', null);
  session.push('rid', function(err) {
    if(err) {
      console.error('entryHandler.leaveTripRoom: set rid for session service failed! error is : %j', err.stack);
    }
  });

  var _uid = '' + uid + '*' + session.get('nickName') + '*' + session.get('avatar');

  this.app.rpc.trip.tripRemote.kick(session, _uid, sid, rid, ()=>{
    next(null, { code: 200, error: false, msg: '已退出行程房间'});
  });
}

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
  if(!!session && !!session.uid) {
    var _uid = '' + session.uid + '*' + session.get('nickName') + '*' + session.get('avatar');
    app.rpc.trip.tripRemote.kick(session, _uid, app.get('serverId'), session.get('rid'), ()=>{});
    return;
  }
};