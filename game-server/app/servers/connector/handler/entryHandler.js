module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

/**
 * New client entry.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {
	var self = this;
	// console.log('开始前 这里的session 是:', session)
	if (!!session.uid) {
		console.log('用户', session.uid, '已经登录, 无需再次登录')
		next(null, {code: 200, error: true, msg: '用户'+session.uid+'已经登录, 无需再次登录'});
		return;
	}
	console.log('开始前 这里的session uid 是:', session.uid)
	if (!!msg.token) {
		// 自动登录
	} else {
		// 下发临时登录Token
		self.app.rpc.user.userRemote.doTempLogin(session, '临时用户', null, 1, 1, function(err, uid, token){
			if (err) {
				next(null, {code: 200, error: true, msg: '下发临时登录Token出错:'+err});
			} else {
				session.bind(uid);
				console.log('结束后 这里的session uid 是:', session.uid)
				next(null, {code: 200, msg: 'temp login success.', token: token});
			}
		});
	}
  // next(null, {code: 200, msg: 'game server is ok.'});
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
