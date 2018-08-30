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
	
	if (!!session.uid) {
		console.log('用户', session.uid, '已经登录, 无需再次登录')
		next(null, {code: 200, error: true, msg: '用户'+session.uid+'已经登录, 无需再次登录'});
		return;
	}

	if (!!msg.token) {
		// 恢复登录
		self.app.rpc.user.userRemote.getUseridByToken(session, msg.token, function(err, uid) {
			if (err) {
				next(null, {code: 200, error: true, msg: 'recovery login error:'+err});
			} else {
				// 断开已经登录此号的Session
				var sessionService = self.app.get('sessionService');
				//duplicate log in
				if( !! sessionService.getByUid(uid)) {}
				session.bind(uid);
				next(null, {code: 200, msg: 'recovery login success.'});
			}
		});
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
