
var SQL = require('../Util/MySQL');
var Util = require('./util');

/**
 * 行程订单数据模型
 */
module.exports = class Model {

    // ———————————————— 增 ———————————————— //

    /**
     * 创建行程,完成即开始,state=1
     * @param {String} userid 用户id
     * @param {(err: String, ordernumber: String)} callback 回调函数
     */
    static createTrip (userid, callback) {

        var ordernumber = Util.makeTripOrderNumber();

        SQL.execute('INSERT INTO trip (order_number, user_id, state) VALUES(?,?,1)',
                    [ordernumber, userid],
            function(err, result) {
                if (callback) {
                    callback(err, err ? null : ordernumber);
                }
            }
        );
    }

    /**
     * 添加行程位置坐标
     * @param {String} ordernumber 行程订单编号
     * @param {String} longitude 经度
     * @param {String} latitude 纬度
     * @param {String} remark 备注
     * @param {(err: String,)} callback 回调函数,成功返回null,如出错则返回err
     */
    static addTripLocationPoint (ordernumber, longitude, latitude, remark, callback) {
        SQL.execute('INSERT INTO trip_polyline (order_number, longitude, latitude, remark) VALUES(?,?,?,?)',
                    [ordernumber, longitude, latitude, remark],
            function(err, result) {
                if (callback) {
                    callback(err);
                }
            }
        );
    }

    /**
     * 添加行程日志
     * @param {String} ordernumber 行程订单编号
     * @param {Number} eventtype 事件类型
     * @param {String} operation 操作内容
     * @param {String} remark 备注
     * @param {(err: String,)} callback 回调函数,成功返回null,如出错则返回err
     */
    static addTripLog (ordernumber, eventtype, operation, remark, callback) {
        SQL.execute('INSERT INTO trip_logs (order_number, event_type, operation, remark) VALUES(?,?,?,?)',
                    [ordernumber, eventtype, operation, remark],
            function(err, result) {
                if (callback) {
                    callback(err);
                }
            }
        );
    }

    // ———————————————— 删 ———————————————— //
    // ———————————————— 改 ———————————————— //

    /**
     * 设置行程状态
     * @param {String} ordernumber 行程订单编号
     * @param {Number} state 将要更改的状态
     * @param {String} operation 操作内容
     * @param {String} remark 备注
     * @param {(err: String,)} callback 回调函数,成功返回null,如出错则返回err
     */
    static setTripState (ordernumber, state, operation, remark, callback) {

        DBPool.getConnection(function(err, connection) {
            if (err || !connection) {  return callback('database error: pool get connection.'); }

            connection.beginTransaction(function(err) {
                if (err) { callback('database error: start transaction.'); }
                connection.query('UPDATE trip SET state = ? WHERE order_number = ?', 
                                [state, ordernumber], 
                                function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function() {
                                connection.release();
                                callback('database error: update state.');
                            });
                    } else if (results['changedRows'] <= 0) {
                        connection.release();
                        callback('No find trip order.');
                        return;
                    }
                    
                    connection.query('INSERT INTO trip_logs (order_number, event_type, operation, remark) VALUES(?,1,?,?)', 
                                    [ordernumber, operation, remark], 
                                    function (error, results, fields) {
                        if (error) {
                            return connection.rollback(function() {
                                connection.release();
                                callback('database error: add trip log.');
                            });
                        }
                        connection.commit(function(err) {
                            if (err) {
                                return connection.rollback(function() {
                                    connection.release();
                                    callback('database error: connection.commit');
                                });
                            }
                            connection.release();
                            callback(null);
                        });
                    });
                });
            });
        });
    }

    // ———————————————— 查 ———————————————— //

    /**
     * 获取未完成的行程
     * @param {String} userid 用户id
     * @param {(err: String, ordernumber: String)} callback 事件回调
     */
    static getUnfinished (userid, callback) {
        SQL.execute(
            'SELECT order_number FROM trip WHERE user_id = ? AND (state = 1 OR state = 3)',
            [userid],
            function(err, result) {
                if (callback) {
                    if (err) {
                        callback('[SELECT ERROR] - ' + err.message);
                    } else if (result.length > 0) {
                        callback(null, result[0]['order_number']);
                    } else {
                        callback(null, null); // 查询结果正常,但未查询到结果
                    }
                }
            }
        );
    }

    /**
     * 获取行程信息
     * @param {String} ordernumber 订单编号
     * @param {(err: String,  data: {userid: String, state: Number, created_time: String})} callback 回调函数
     */
    static getTripInfo (ordernumber, callback) {
        SQL.execute(
            'SELECT * FROM trip WHERE order_number = ?',
            [ordernumber],
            function(err, result) {
                if (callback) {
                    if (err) {
                        callback(err);
                    } else if (result.length > 0) {
                        callback(null, 
                            {
                                userid: result[0]['user_id'], 
                                state: result[0]['state'], 
                                created_time: result[0]['created_time']
                            });
                    } else {
                        callback('无此行程订单');
                    }
                }
            }
        );
    }

    /**
     * 获取行程日志
     * @param {String} ordernumber 行程订单编号
     * @param {(err: String, data: [{event_type: Number, operation: String, remark: String, created_time: String}])} callback 回调函数
     */
    static getTripLogs (ordernumber, callback) {
        SQL.execute(
            'SELECT * FROM trip_logs WHERE order_number=? ORDER BY created_time',
            [ordernumber],
            function(err, result) {
                if (callback) {
                    if (err) {
                        callback('查询错误', null);
                    } else {
                        var callbackValue = result.map((currentValue, index, arr) => {
                            return {
                                event_type: currentValue['event_type'],
                                operation: currentValue['operation'],
                                remark: currentValue['remark'],
                                created_time: currentValue['created_time']
                            }
                        });
                        callback(null, callbackValue);
                    }
                }
            }
        );
    }

    /**
     * 获取行程路线
     * @param {String} ordernumber 行程订单编号
     * @param {(err: String, data: [{longitude: String, latitude: String, remark: String, created_time: String}])} callback 回调函数
     */
    static getTripPolyline (ordernumber, callback) {
        SQL.execute(
            'SELECT * FROM trip_polyline WHERE order_number=? ORDER BY created_time',
            [ordernumber],
            function(err, result) {
                if (callback) {
                    if (err) {
                        callback('查询错误', null);
                    } else {
                        var callbackValue = result.map((currentValue, index, arr) => {
                            return {
                                longitude: currentValue['longitude'],
                                latitude: currentValue['latitude'],
                                remark: currentValue['remark'],
                                created_time: currentValue['created_time']
                            }
                        });
                        callback(null, callbackValue);
                    }
                }
            }
        );
    }

}