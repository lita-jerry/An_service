
var SQL = require('../Util/MySQL');
var Util = require('./util');

/**
 * 行程订单数据模型
 */
module.exports = class Model {

    // ———————————————— 增 ———————————————— //

    /**
     * 创建行程订单
     * @param {String} userid 用户id
     * @param {(err: String, ordernumber: String)} callback 回调函数
     */
    static createTripOrder (userid, callback) {

        var ordernumber = Util.makeTripOrderNumber();

        SQL.execute('INSERT INTO trip (order_number, user_id, state, type) VALUES(?,?,0,1)',
                    [ordernumber, userid],
            function(err, result) {
                if (callback) {
                    callback(err, err ? null : ordernumber);
                }
            }
        );
    }

    /**
     * 添加行程位置日志
     * @param {String} ordernumber 订单编号
     * @param {String} longitude 经度
     * @param {String} latitude 纬度
     * @param {(err: String,)} callback 回调函数
     */
    static addTripLocationLog (ordernumber, longitude, latitude, callback) {
        DBPool.getConnection(function(err, connection) {
            if (err || !connection) {  return callback('database error: pool get connection.'); }
            connection.beginTransaction(function(err) {
                if (err) { callback('database error: start transaction.'); }
                connection.query('INSERT INTO trip_location_upload_log (order_number, longitude, latitude) VALUES(?,?,?)', 
                                [ordernumber, longitude, latitude], 
                                function (error, results, fields) {
                if (error) {
                    return connection.rollback(function() {
                        connection.release();
                        callback('database error: insert trip location upload log.');
                    });
                }
                
                connection.query('UPDATE trip SET last_upload_location_time = NOW()', 
                                [], 
                                function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function() {
                            connection.release();
                            callback('database error: update trip last upload location time.');
                        });
                    } else if (results['changedRows'] === 0) {
                        return connection.rollback(function() {
                            connection.release();
                            callback('database error: 没有此行程.');
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

    // ———————————————— 删 ———————————————— //
    // ———————————————— 改 ———————————————— //

    /**
     * 取消行程订单 state = 0 - 4
     * @param {String} ordernumber 订单编号
     * @param {String} session 用户登录session
     * @param {(err: String)} callback 回调函数
     */
    static cancelTripOrder (ordernumber, userid, callback) {

        DBPool.getConnection(function(err, connection) {
            if (err || !connection) {  return callback('database error: pool get connection.'); }

            connection.beginTransaction(function(err) {
                if (err) { callback('database error: start transaction.'); }
                connection.query('UPDATE trip SET state = 4 WHERE order_number = ? AND user_id = ? AND state = 0', 
                                [ordernumber, userid], 
                                function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function() {
                                connection.release();
                                callback('database error: update state.');
                            });
                    } else if (results['changedRows'] > 0) {
                        var operation = 'state: 0 to 4';
                    } else {
                        connection.release();
                        callback('No find trip order.');
                        return;
                    }
                    
                    connection.query('INSERT INTO trip_info_update_log (order_number, type, operation, remark) VALUES(?,1,?,?)', 
                                    [ordernumber, operation, ''], 
                                    function (error, results, fields) {
                        if (error) {
                            return connection.rollback(function() {
                                connection.release();
                                callback('database error: write log.');
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

    /**
     * 开始行程订单 state = 0 - 1
     * @param {String} ordernumber 订单编号
     * @param {String} userid 用户id
     * @param {(err: String)} callback 回调函数
     */
    static startTripOrder (ordernumber, userid, callback) {

        DBPool.getConnection(function(err, connection) {
            if (err || !connection) {  return callback('database error: pool get connection.'); }

            connection.beginTransaction(function(err) {
                if (err) { callback('database error: start transaction.'); }
                connection.query('UPDATE trip SET state = 1 WHERE order_number = ? AND user_id = ? AND state = 0', 
                                [ordernumber, userid], 
                                function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function() {
                                connection.release();
                                callback('database error: update state.');
                            });
                    } else if (results['changedRows'] > 0) {
                        var operation = 'state: 0 to 1';
                    } else {
                            connection.release();
                            callback('No find trip order.');
                            return;
                    }
                    
                    connection.query('INSERT INTO trip_info_update_log (order_number, type, operation, remark) VALUES(?,1,?,?)', 
                                    [ordernumber, operation, ''], 
                                    function (error, results, fields) {
                        if (error) {
                            return connection.rollback(function() {
                                connection.release();
                                callback('database error: write log.');
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

    /**
     * 结束行程订单 state = 1 | 3 - 2
     * @param {String} ordernumber 订单编号
     * @param {String} userid 用户id
     * @param {(err: String)} callback 回调函数
     */
    static stopTripOrder (ordernumber, userid, callback) {

        DBPool.getConnection(function(err, connection) {
            if (err || !connection) {  return callback('database error: pool get connection.'); }

            connection.beginTransaction(function(err) {
                if (err) { callback('database error: start transaction.'); }
                connection.query('UPDATE trip SET state = 2 WHERE order_number = ? AND user_id = ? AND (state = 1 OR state = 3)', 
                                [ordernumber, userid], 
                                function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function() {
                                connection.release();
                                callback('database error: update state.');
                            });
                    } else if (results['changedRows'] > 0) {
                        var operation = 'state: 1 | 3 to 2';
                    } else {
                        connection.release();
                        callback('No find trip order.');
                        return;
                    }
                    
                    connection.query('INSERT INTO trip_info_update_log (order_number, type, operation, remark) VALUES(?,1,?,?)', 
                                    [ordernumber, operation, ''], 
                                    function (error, results, fields) {
                        if (error) {
                        return connection.rollback(function() {
                            connection.release();
                            callback('database error: write log.');
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

    /**
     * 发出求救 state = 1 - 3
     * @param {String} ordernumber 订单编号
     * @param {String} userid 用户id
     * @param {(err: String)} callback 回调函数
     */
    static startSOS (ordernumber, userid, callback) {

        DBPool.getConnection(function(err, connection) {
            if (err || !connection) {  return callback('database error: pool get connection.'); }

            connection.beginTransaction(function(err) {
                if (err) { callback('database error: start transaction.'); }
                connection.query('UPDATE trip SET state = 3 WHERE order_number = ? AND user_id = ? AND state = 1', 
                                [ordernumber, userid], 
                                function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function() {
                                connection.release();
                                callback('database error: update state.');
                            });
                    } else if (results['changedRows'] > 0) {
                        var operation = 'state: 1 to 3';
                    } else {
                        connection.release();
                        callback('No find trip order.');
                        return;
                    }
                    
                    connection.query('INSERT INTO trip_info_update_log (order_number, type, operation, remark) VALUES(?,1,?,?)', 
                                    [ordernumber, operation, ''], 
                                    function (error, results, fields) {
                        if (error) {
                            return connection.rollback(function() {
                                connection.release();
                                callback('database error: write log.');
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

    /**
     * 解除求救 state = 3 - 1
     * @param {String} ordernumber 订单编号
     * @param {String} userid 用户id
     * @param {(err: String)} callback 回调函数
     */
    static stopSOS (ordernumber, userid, callback) {

        DBPool.getConnection(function(err, connection) {
            if (err || !connection) {  return callback('database error: pool get connection.'); }

            connection.beginTransaction(function(err) {
                    if (err) { callback('database error: start transaction.'); }
                    connection.query('UPDATE trip SET state = 1 WHERE order_number = ? AND user_id = ? AND state = 3', 
                                    [ordernumber, userid], 
                                    function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function() {
                                connection.release();
                                callback('database error: update state.');
                            });
                    } else if (results['changedRows'] > 0) {
                        var operation = 'state: 3 to 1';
                    } else {
                        connection.release();
                        callback('No find trip order.');
                        return;
                    }
                    
                    connection.query('INSERT INTO trip_info_update_log (order_number, type, operation, remark) VALUES(?,1,?,?)', [ordernumber, operation, ''], function (error, results, fields) {
                        if (error) {
                        return connection.rollback(function() {
                            connection.release();
                            callback('database error: write log.');
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

    /**
     * 更新行程信息
     * @param {String} ordernumber 订单编号
     * @param {String} destination 目的地
     * @param {String} tool 交通工具
     * @param {(err: String)} callback 回调函数
     */
    static updateTripInfo (ordernumber, destination, tool, callback) {

        DBPool.getConnection(function(err, connection) {
            if (err || !connection) {  return callback('database error: pool get connection.'); }
            connection.beginTransaction(function(err) {
                    if (err) { callback('database error: start transaction.'); }
                    connection.query('UPDATE trip SET destination = ?, tool = ? WHERE order_number = ? AND state = 0', [destination, tool, ordernumber], function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function() {
                            connection.release();
                            callback('database error: update state.');
                        });
                    } else if (results['changedRows'] > 0) {
                        var operation = 'destination:' + destination + ' & tool:' + tool;
                    } else {
                        connection.release();
                        callback('No change.');
                        return;
                    }
                    connection.query('INSERT INTO trip_info_update_log (order_number, type, operation, remark) VALUES(?,2,?,?)', [ordernumber, operation, ''], function (error, results, fields) {
                        if (error) {
                            return connection.rollback(function() {
                                connection.release();
                                callback('database error: write log.');
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
     * 获取当前未完成的订单
     * @param {String} userid 用户id
     * @param {(err: String, ordernumber: String)} callback 事件回调
     */
    static getUnfinishedOrder (userid, callback) {
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
     * @param {(err: String, userid: String, state: String, type: String, destination: String, tool: String, created_time: String)} callback 回调函数
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
                            result[0]['user_id'], 
                            result[0]['state'], 
                            result[0]['type'], 
                            result[0]['destination'], 
                            result[0]['tool'], 
                            result[0]['created_time']);
                    } else {
                        callback('无此行程订单');
                    }
                }
            }
        );
    }

    /**
     * 获取行程订单的所属用户id
     * @param {String} ordernumber 订单编号
     * @param {(err: String, userid: String)} callback 回调函数
     */
    static getUseridOfTripOrdernumber (ordernumber, callback) {
        SQL.execute(
            'SELECT * FROM trip WHERE order_number=?',
            [ordernumber],
            function(err, result) {
                if (callback) {
                    if (err === null && result.length > 0) {
                        callback(null, result[0]['user_id']);
                    } else {
                        callback('未找到对应行程', null);
                    }
                }
            }
        );
    }

    /**
     * 获取位置轨迹
     * @param {String} ordernumber 订单编号
     * @param {(err: String, result: String)} callback 回调函数
     */
    static getTripLocationLocus (ordernumber, callback) {
        SQL.execute(
            'SELECT * FROM trip_location_upload_log WHERE order_number=? ORDER BY created_time',
            [ordernumber],
            function(err, result) {
                if (callback) {
                    if (err === null && result.length > 0) {
                        var callbackValue = result.map((currentValue, index, arr) => {
                                return {
                                    time: currentValue['created_time'],
                                    longitude: currentValue['longitude'],
                                    latitude: currentValue['latitude']
                                }
                            });
                        callback(null, JSON.stringify(callbackValue));
                    } else {
                        callback('未查询到该行程信息', null);
                    }
                }
            }
        );
    }
}