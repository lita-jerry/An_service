
var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    // console.log('Time: ', Date.now(), '\noriginalUrl: ', req.originalUrl);
    next();
});

/**
 * 微信小程序用户注册
 */
router.get('/wxmp/regist', function(req, res, next) {
    var code = req.query.code;
    var nickname  = req.query.nickname;
    var avatarurl  = req.query.avatarurl;

    var codeCheck = code != null && code.length > 0;
    var nicknameCheck = nickname != null && nickname.length > 0 && nickname.length <= 32;
    var avatarurlCheck = avatarurl != null && avatarurl.length > 0 && avatarurl.length < 64;

    if (codeCheck && nicknameCheck && avatarurlCheck) {
        require('./WXMPController').regist(code, nickname, avatarurl, (err, session) => {
            var response;
            if (err) {
                response = { code: err.code, msg : err.msg };
            } else {
                response = { code: 0, msg : '成功', session: session };
            }
            res.send(JSON.stringify(response));
        })
    }else{
        var response = { code: -1, msg : '参数不正确' }
        res.send(JSON.stringify(response));
    }
})

/**
 * 微信小程序用户登录
 */
router.get('/wxmp/login', function(req, res, next) {
    var code = req.query.code;
    if (code != null && code.length > 0) {
        require('./WXMPController').login(code, (err, session) => {
            var response;
            if (err) {
                response = {
                    code: err.code,
                    msg : err.msg
                }
            } else {
                response = {
                    code: 0,
                    msg : '登录成功',
                    session: session
                }
            }
            res.send(JSON.stringify(response));
        })
    }else{
        var response = { code: -1, msg : '参数不正确' }
        res.send(JSON.stringify(response));
    }
})

/**
 * 微信小程序用户信息更新
 */
router.get('/wxmp/info/update', function(req, res, next) {
    var session = req.query.session;
    var nickname = req.query.nickname;
    var avatarurl = req.query.avatarurl;

    var sessionCheck = session != null && session.length > 0
    var nicknameCheck = nickname != null && nickname.length > 0 && nickname.length <= 32;
    var avatarurlCheck = avatarurl != null && avatarurl.length > 0 && avatarurl.length < 64;

    if (sessionCheck && nicknameCheck && avatarurlCheck) {
        require('./WXMPController').infoUpdate(session, nickname, avatarurl, (err) => {
            var response = { code: err ? err.code : 0, msg : err ? err.msg : '更新成功' };
            res.send(JSON.stringify(response));
        })
    }else{
        var response = { code: -1, msg : '参数不正确' }
        res.send(JSON.stringify(response));
    }
})

module.exports = router;