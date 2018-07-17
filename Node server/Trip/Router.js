
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
                msg : err ? err.msg : ordernumber ? '有可恢复行程' : '无可恢复行程', 
                ordernumber: ordernumber 
            };
            res.send(JSON.stringify(response));
        });
    } else {
        var response = { code: -1, msg : '参数不正确' }
        res.send(JSON.stringify(response));
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
        var response = { code: -1, msg : '参数不正确' }
        res.send(JSON.stringify(response));
    }
});

/**
 * 取消行程(开始前)
 */
router.get('/cancel', function(req, res, next) {
    var session = req.query.session;
    var sessionCheck = session != null && session.length > 0;

    var ordernumber = req.query.ordernumber;
    var ordernumberCheck = ordernumber != null && ordernumber.length > 0;

    if (sessionCheck && ordernumberCheck) {
        require('./APIController').cancel(session, ordernumber, (err) => {
            var response = { code: err ? err.code : 0, msg : err ? err.msg : '行程已取消' };
            res.send(JSON.stringify(response));
        });
    } else {
        var response = { code: -1, msg : '参数不正确' }
        res.send(JSON.stringify(response));
    }
});

/**
 * 开始行程
 */
router.get('/start', function(req, res, next) {
    var session = req.query.session;
    var sessionCheck = session != null && session.length > 0;

    var ordernumber = req.query.ordernumber;
    var ordernumberCheck = ordernumber != null && ordernumber.length > 0;

    if (sessionCheck && ordernumberCheck) {
        require('./APIController').start(session, ordernumber, (err) => {
            var response = { code: err ? err.code : 0, msg : err ? err.msg : '行程已开始' };
            res.send(JSON.stringify(response));
        });
    } else {
        var response = { code: -1, msg : '参数不正确' }
        res.send(JSON.stringify(response));
    }
});

/**
 * 结束行程
 */
router.get('/stop', function(req, res, next) {
    var session = req.query.session;
    var sessionCheck = session != null && session.length > 0;

    var ordernumber = req.query.ordernumber;
    var ordernumberCheck = ordernumber != null && ordernumber.length > 0;

    if (sessionCheck && ordernumberCheck) {
        require('./APIController').stop(session, ordernumber, (err) => {
            var response = { code: err ? err.code : 0, msg : err ? err.msg : '行程已结束' };
            res.send(JSON.stringify(response));
        });
    } else {
        var response = { code: -1, msg : '参数不正确' }
        res.send(JSON.stringify(response));
    }
});

/**
 * 发出求救
 */
router.get('/sos/start', function(req, res, next) {
    var session = req.query.session;
    var sessionCheck = session != null && session.length > 0;

    var ordernumber = req.query.ordernumber;
    var ordernumberCheck = ordernumber != null && ordernumber.length > 0;

    if (sessionCheck && ordernumberCheck) {
        require('./APIController').startSOS(session, ordernumber, (err) => {
            var response = { code: err ? err.code : 0, msg : err ? err.msg : '已发出求救' };
            res.send(JSON.stringify(response));
        });
    } else {
        var response = { code: -1, msg : '参数不正确' }
        res.send(JSON.stringify(response));
    }
});

/**
 * 解除求救
 */
router.get('/sos/stop', function(req, res, next) {
    var session = req.query.session;
    var sessionCheck = session != null && session.length > 0;

    var ordernumber = req.query.ordernumber;
    var ordernumberCheck = ordernumber != null && ordernumber.length > 0;

    if (sessionCheck && ordernumberCheck) {
        require('./APIController').stopSOS(session, ordernumber, (err) => {
            var response = { code: err ? err.code : 0, msg : err ? err.msg : '已解除求救' };
            res.send(JSON.stringify(response));
        });
    } else {
        var response = { code: -1, msg : '参数不正确' }
        res.send(JSON.stringify(response));
    }
});

/**
 * 获取行程信息
 */
router.get('/info/get', function(req, res, next) {
    var session = req.query.session;
    var sessionCheck = session != null && session.length > 0;

    var ordernumber = req.query.ordernumber;
    var ordernumberCheck = ordernumber != null && ordernumber.length > 0;

    if (sessionCheck && ordernumberCheck) {
        require('./APIController').getTripInfo(session, ordernumber, (err, result) => {
            var response = { 
                code: err ? err.code : 0, 
                msg : err ? err.msg : '查询成功', 
                info: err ? null : JSON.parse(result)
            };
            res.send(JSON.stringify(response));
        });
    } else {
        var response = { code: -1, msg : '参数不正确' }
        res.send(JSON.stringify(response));
    }
});

/**
 * 更新行程信息
 */
router.get('/info/update', function(req, res, next) {
    var session = req.query.session;
    var sessionCheck = session != null && session.length > 0;

    var ordernumber = req.query.ordernumber;
    var ordernumberCheck = ordernumber != null && ordernumber.length > 0;

    var destination = req.query.destination;
    var destinationCheck = destination != null && destination.length > 0 && destination.length <= 32;

    var tool = req.query.tool;
    var toolCheck = tool != null && tool.length > 0 && tool.length <= 32;

    if (sessionCheck && ordernumberCheck && destinationCheck && toolCheck) {
        require('./APIController').updateTripInfo(session, ordernumber, destination, tool, (err) => {
            var response = { code: err ? err.code : 0, msg : err ? err.msg : '更新成功' };
            res.send(JSON.stringify(response));
        });
    } else {
        var response = { code: -1, msg : '参数不正确' }
        res.send(JSON.stringify(response));
    }
});

/**
 * 获取位置(轨迹)
 */
router.get('/location/all', function(req, res, next) {
    var session = req.query.session;
    var sessionCheck = session != null && session.length > 0;

    var ordernumber = req.query.ordernumber;
    var ordernumberCheck = ordernumber != null && ordernumber.length > 0;

    if (sessionCheck && ordernumberCheck) {
        require('./APIController').getTripLocationLocus(session, ordernumber, (err, result) => {
            var response = { 
                code: err ? err.code : 0, 
                msg : err ? err.msg : '查询成功', 
                result: err ? null : JSON.parse(result)
            };
            res.send(JSON.stringify(response));
        });
    } else {
        var response = { code: -1, msg : '参数不正确' }
        res.send(JSON.stringify(response));
    }
});

/**
 * 上报位置(应该用不到,作废?)
 */
// router.get('/location/upload', function(req, res, next) {});

module.exports = router;