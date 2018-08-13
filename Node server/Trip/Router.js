
var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now(), '\noriginalUrl: ', req.originalUrl);
    next();
});

/**
 * 查询我未完成的订单
 */
router.get('/unfinished', function(req, res, next) {
    var session = req.query.session;
    if (session != null && session.length > 0) {
        require('./APIController').getUnfinished(session, (err, ordernumber) => {
            var response = { 
                code: err ? err.code : 0, 
                msg : err ? err.msg : ordernumber ? '有可恢复的行程' : '无可恢复的行程', 
                ordernumber: ordernumber 
            };
            res.send(JSON.stringify(response));
        });
    } else {
        res.send(JSON.stringify({ code: -1, msg : '参数不正确' }));
    }
});

/**
 * 创建行程
 */
router.get('/create', function(req, res, next) {
    var session = req.query.session;
    if (session != null && session.length > 0) {
        require('./APIController').create(session, (err, ordernumber) => {
            var response = { code: err ? err.code : 0, msg : err ? err.msg : '行程创建成功', ordernumber: ordernumber };
            res.send(JSON.stringify(response));
        });
    } else {
        res.send(JSON.stringify({ code: -1, msg : '参数不正确' }));
    }
});

/**
 * 结束行程
 */
router.get('/end', function(req, res, next) {
    var session = req.query.session;
    var sessionCheck = session != null && session.length > 0;

    var ordernumber = req.query.ordernumber;
    var ordernumberCheck = ordernumber != null && ordernumber.length > 0;

    if (sessionCheck && ordernumberCheck) {
        require('./APIController').end(session, ordernumber, (err) => {
            if (err) {
                res.send(JSON.stringify({code: err.code, msg: err.msg}));
            } else {
                res.send(JSON.stringify({code: 0, msg: '行程已结束'}))
            }
        });
    } else {
        res.send(JSON.stringify({ code: -1, msg : '参数不正确' }));
    }
});

/**
 * 发出求救
 */
router.get('/sos', function(req, res, next) {
    var session = req.query.session;
    var sessionCheck = session != null && session.length > 0;

    var ordernumber = req.query.ordernumber;
    var ordernumberCheck = ordernumber != null && ordernumber.length > 0;

    if (sessionCheck && ordernumberCheck) {
        require('./APIController').SOS(session, ordernumber, (err) => {
            if (err) {
                res.send(JSON.stringify({code: err.code, msg: err.msg}));
            } else {
                res.send(JSON.stringify({code: 0, msg: '已发出求救'}));
            }
        });
    } else {
        res.send(JSON.stringify({ code: -1, msg : '参数不正确' }));
    }
});

/**
 * 获取行程信息
 */
router.get('/info', function(req, res, next) {
    var session = req.query.session;
    var sessionCheck = session != null && session.length > 0;

    var ordernumber = req.query.ordernumber;
    var ordernumberCheck = ordernumber != null && ordernumber.length > 0;

    if (sessionCheck && ordernumberCheck) {
        require('./APIController').getTripInfo(session, ordernumber, (err, result) => {
            if (err) {
                res.send(JSON.stringify({code: err.code, msg: err.msg}));
            } else {
                res.send(JSON.stringify({code: 0, msg : '查询成功', info: JSON.parse(result)}));
            }
        });
    } else {
        res.send(JSON.stringify({ code: -1, msg : '参数不正确' }));
    }
});

/**
 * 获取行程路线
 */
router.get('/polyline', function(req, res, next) {
    var session = req.query.session;
    var sessionCheck = session != null && session.length > 0;

    var ordernumber = req.query.ordernumber;
    var ordernumberCheck = ordernumber != null && ordernumber.length > 0;

    if (sessionCheck && ordernumberCheck) {
        require('./APIController').getTripPolyline(session, ordernumber, (err, result) => {
            if (err) {
                res.send(JSON.stringify({code: err.code, msg: err.msg, polyline: null}));
            } else {
                res.send(JSON.stringify({code: 0, msg: '行程路线获取成功', polyline: JSON.parse(result)}));
            }
        });
    } else {
        res.send(JSON.stringify({ code: -1, msg : '参数不正确' }));
    }
});

/**
 * 获取行程日志
 */
router.get('/logs', function(req, res, next) {
    var session = req.query.session;
    var sessionCheck = session != null && session.length > 0;

    var ordernumber = req.query.ordernumber;
    var ordernumberCheck = ordernumber != null && ordernumber.length > 0;

    if (sessionCheck && ordernumberCheck) {
        require('./APIController').getTripLogs(session, ordernumber, (err, result) => {
            if (err) {
                res.send(JSON.stringify({code: err.code, msg: err.msg, polyline: null}));
            } else {
                console.log(JSON.parse(result));
                res.send(JSON.stringify({code: 0, msg: '行程日志获取成功', logs: JSON.parse(result)}));
            }
        });
    } else {
        res.send(JSON.stringify({ code: -1, msg : '参数不正确' }));
    }
});

module.exports = router;