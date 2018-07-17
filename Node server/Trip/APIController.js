
var TripModel = require('./Model');
var UserModel = require('../User/Model');

/**
 * 创建行程订单
 * @param {String} session 
 * @param {(err: {code: Number, msg: String}, ordernumber: String)} callback 回调函数
 */
var create = function(session, callback) {

    var async = require("async");

    async.waterfall([
        function(_callback){
            // 获取用户id
            UserModel.getUseridWithSession(session, (err, userid) => {
                if (err) {
                    _callback(9001, err)
                } else {
                    _callback(null, userid);
                }
            });
        },
        function(userid, _callback){
            // 查询是否有未完成的订单
            TripModel.getUnfinishedOrder(userid, (err, ordernumber) => {
                if (err) {
                    _callback(9002, err);
                } else if (ordernumber) {
                    _callback(9003, '当前有未完成的订单');
                } else {
                    _callback(null, userid);
                }
            });
        },
        function(userid, _callback){
            // 创建订单
            TripModel.createTripOrder(userid, (err, ordernumber) => {
                if (err) {
                    _callback(9004, err);
                } else {
                    _callback(null, ordernumber);
                }
            });
        }
    ], function (err, result) {
        if (callback) {
            if (err) {
                callback({code: err, msg: result}, null);
            } else {
                callback(null, result);
            }
        }
    });
}

/**
 * 获取当前未完成的行程
 * @param {String} session 用户登录session
 * @param {(err: {code: Number, msg: String}, ordernumber: String)} callback 回调函数
 */
var getUnfinished = function(session, callback) {
    
    var async = require("async");

    async.waterfall([
        function(_callback){
            // 获取用户id
            UserModel.getUseridWithSession(session, (err, userid) => {
                if (err) {
                    _callback(9001, err)
                } else {
                    _callback(null, userid);
                }
            });
        },
        function(userid, _callback){
            // 查询是否有未完成的订单
            TripModel.getUnfinishedOrder(userid, (err, ordernumber) => {
                if (err) {
                    _callback(9001, err)
                } else {
                    _callback(null, ordernumber);
                }
                
            });
        }
    ], function (err, result) {
        if (callback) {
            if (err) {
                callback({code: err, msg: result}, null);
            } else {
                callback(null, result);
            }
        }
    });
}

/**
 * 取消行程订单(仅在未开始前)
 * @param {String} session 用户登录session
 * @param {String} ordernumber 订单编号
 * @param {(err: {code: Number, msg: String})} callback 回调函数
 */
var cancel = function(session, ordernumber, callback) {

    var async = require("async");

    async.waterfall([
        function(_callback){
            // 获取用户id
            UserModel.getUseridWithSession(session, (err, userid) => {
                if (err) {
                    _callback(9001, err)
                } else {
                    _callback(null, userid);
                }
            });
        },
        function(userid, _callback){
            // 取消订单
            TripModel.cancelTripOrder(ordernumber, userid, (err) => {
                _callback(err ? 9002 : null, err ? err : null);
            });
        }
    ], function (err, result) {
        if (callback) {
            if (err) {
                callback({code: err, msg: result});
            } else {
                callback(null);
            }
        }
    });
}

/**
 * 开始行程订单(仅在未开始前)
 * @param {String} session 用户登录session
 * @param {String} ordernumber 订单编号
 * @param {(err: {code: Number, msg: String})} callback 回调函数
 */
var start = function(session, ordernumber, callback) {

    var async = require("async");

    async.waterfall([
        function(_callback){
            // 获取用户id
            UserModel.getUseridWithSession(session, (err, userid) => {
                if (err) {
                    _callback(9001, err)
                } else {
                    _callback(null, userid);
                }
            });
        },
        function(userid, _callback){
            // 开始订单
            TripModel.startTripOrder(ordernumber, userid, (err) => {
                _callback(err ? 9002 : null, err ? err : null);
            });
        }
    ], function (err, result) {
        if (callback) {
            if (err) {
                callback({code: err, msg: result});
            } else {
                callback(null);
            }
        }
    });
}

/**
 * 结束行程订单
 * @param {String} session 用户登录session
 * @param {String} ordernumber 订单编号
 * @param {(err: {code: Number, msg: String})} callback 回调函数
 */
var stop = function(session, ordernumber, callback) {

    var async = require("async");

    async.waterfall([
        function(_callback){
            // 获取用户id
            UserModel.getUseridWithSession(session, (err, userid) => {
                if (err) {
                    _callback(9001, err)
                } else {
                    _callback(null, userid);
                }
            });
        },
        function(userid, _callback){
            // 结束订单
            TripModel.stopTripOrder(ordernumber, userid, (err) => {
                _callback(err ? 9002 : null, err ? err : null);
            });
        }
    ], function (err, result) {
        if (callback) {
            if (err) {
                callback({code: err, msg: result});
            } else {
                callback(null);
            }
        }
    });
}

/**
 * 发出求救
 * @param {String} session 用户登录session
 * @param {String} ordernumber 订单编号
 * @param {(err: {code: Number, msg: String})} callback 回调函数
 */
var startSOS = function(session, ordernumber, callback) {

    var async = require("async");

    async.waterfall([
        function(_callback){
            // 获取用户id
            UserModel.getUseridWithSession(session, (err, userid) => {
                if (err) {
                    _callback(9001, err)
                } else {
                    _callback(null, userid);
                }
            });
        },
        function(userid, _callback){
            // 发出求救
            TripModel.startSOS(ordernumber, userid, (err) => {
                _callback(err ? 9002 : null, err ? err : null);
            });
        }
    ], function (err, result) {
        if (callback) {
            if (err) {
                callback({code: err, msg: result});
            } else {
                callback(null);
            }
        }
    });
}

/**
 * 解除求救
 * @param {String} session 用户登录session
 * @param {String} ordernumber 订单编号
 * @param {(err: {code: Number, msg: String})} callback 回调函数
 */
var stopSOS = function(session, ordernumber, callback) {

    var async = require("async");

    async.waterfall([
        function(_callback){
            // 获取用户id
            UserModel.getUseridWithSession(session, (err, userid) => {
                if (err) {
                    _callback(9001, err)
                } else {
                    _callback(null, userid);
                }
            });
        },
        function(userid, _callback){
            // 解除求救
            TripModel.stopSOS(ordernumber, userid, (err) => {
                _callback(err ? 9002 : null, err ? err : null);
            });
        }
    ], function (err, result) {
        if (callback) {
            if (err) {
                callback({code: err, msg: result});
            } else {
                callback(null);
            }
        }
    });
}

/**
 * 获取订单信息
 * @param {String} session 用户登录session
 * @param {String} ordernumber 订单编号
 * @param {(err: {code: Number, msg: String}, result: String)} callback 回调函数
 */
var getTripInfo = function(session, ordernumber, callback) {

    var async = require("async");

    async.waterfall([
        function(_callback){
            // 获取用户id
            UserModel.getUseridWithSession(session, (err, userid) => {
                if (err) {
                    _callback(9001, err)
                } else {
                    _callback(null, userid);
                }
            });
        },
        function(userid, _callback){
            // 获取订单信息
            TripModel.getTripInfo(ordernumber, (err, userid, state, type, destination, tool, created_time) => {
                _callback(err ? 9002 : null , err ? err : JSON.stringify({
                    type: type,
                    destination: destination,
                    tool: tool,
                    state: state,
                    created_time: created_time
                }));
            });
        }
    ], function (err, result) {
        if (callback) {
            if (err) {
                callback({code: err, msg: result}, null);
            } else {
                callback(null, result);
            }
        }
    });
}

/**
 * 更新行程信息
 * @param {String} session 用户登录session
 * @param {String} ordernumber 订单编号
 * @param {String} destination 目的地
 * @param {String} tool 搭乘工具
 * @param {(err: {code: Number, msg: String})} callback 回调函数
 */
var updateTripInfo = function(session, ordernumber, destination, tool, callback) {

    var async = require("async");

    async.waterfall([
        function(_callback){
            // 获取用户id
            UserModel.getUseridWithSession(session, (err, userid) => {
                if (err) {
                    _callback(9001, err)
                } else {
                    _callback(null, userid);
                }
            });
        },
        function(userid, _callback){
            // 获取订单所属用户id
            TripModel.getUseridOfTripOrdernumber(ordernumber, (err, _userid) => {
                if (userid === _userid) {
                    _callback(null);
                } else {
                    _callback(9002, '无权限操作');
                }
            });
        },
        function(_callback){
            // 修改订单信息
            TripModel.updateTripInfo(ordernumber, destination, tool, (err) => {
                _callback(err ? 9003 : null, err ? err : null);
            });
        }
    ], function (err, result) {
        if (callback) {
            if (err) {
                callback({code: err, msg: result});
            } else {
                callback(null);
            }
        }
    });
}

/**
 * 上传行程位置
 * @param {String} session 用户登录session
 * @param {String} ordernumber 订单编号
 * @param {String} longitude 经度
 * @param {String} latitude 纬度
 * @param {(err: {code: Number, msg: String})} callback 回调函数
 */
var uploadTripLocation = function(session, ordernumber, longitude, latitude, callback) {

    var async = require("async");

    async.waterfall([
        function(_callback){
            // 获取用户id
            UserModel.getUseridWithSession(session, (err, userid) => {
                if (err) {
                    _callback(9001, err)
                } else {
                    _callback(null, userid);
                }
            });
        },
        function(userid, _callback){
            // 获取订单所属用户id
            TripModel.getUseridOfTripOrdernumber(ordernumber, (err, _userid) => {
                if (userid === _userid) {
                    _callback(null);
                } else {
                    _callback(9002, '无权限操作');
                }
            });
        },
        function(_callback){
            // 添加位置log
            TripModel.addTripLocationLog(ordernumber, longitude, latitude, (err) => {
                _callback(err ? 9003 : null, err ? err : null);
            });
        }
    ], function (err, result) {
        if (callback) {
            if (err) {
                callback({code: err, msg: result});
            } else {
                callback(null);
            }
        }
    });
}

/**
 * 获取行程位置轨迹
 * @param {String} session 用户登录session
 * @param {String} ordernumber 订单编号
 * @param {(err: {code: Number, msg: String}, result: String)} callback 回调函数
 */
var getTripLocationLocus = function(session, ordernumber, callback) {

    var async = require("async");

    async.waterfall([
        function(_callback){
            // 获取用户id
            UserModel.getUseridWithSession(session, (err, userid) => {
                if (err) {
                    _callback(9001, err)
                } else {
                    _callback(null, userid);
                }
            });
        },
        function(userid, _callback){
            // 获取行程轨迹
            TripModel.getTripLocationLocus(ordernumber, (err, result) => {
                _callback(err ? 9005 : null, err ? err : result);
            });
        }
    ], function (err, result) {
        if (callback) {
            if (err) {
                callback({code: err, msg: result}, null);
            } else {
                callback(null, result);
            }
        }
    });
}

exports.create = create;
exports.getUnfinished = getUnfinished;
exports.cancel = cancel;
exports.start = start;
exports.stop = stop;
exports.startSOS = startSOS;
exports.stopSOS = stopSOS;
exports.getTripInfo = getTripInfo;
exports.updateTripInfo = updateTripInfo;
exports.uploadTripLocation = uploadTripLocation;
exports.getTripLocationLocus = getTripLocationLocus;
