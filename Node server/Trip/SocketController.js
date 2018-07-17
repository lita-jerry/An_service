
var UserModel = require('../User/Model');
var TripModel = require('./Model');
var TripAPIController = require('./APIController')

/**
 * 行程订单Socket服务
 */
module.exports = class Model {

    /**
     * 启动行程订单Socket服务
     * @param {http.Server} appserver APP http.Server实例
     * @param {(Model)} callback 回调函数
     */
    static startSocketServer(appserver, callback) {
        var socketServer = new Model();
        socketServer.startSocketServer(appserver);
        callback(socketServer);
    }

    // Module构造函数
    constructor (server) {
    }

    /**
     * 启动Socket服务
     */
    startSocketServer (server) {

        // 创建socket服务
        var socketIO = require('socket.io')(server).of('/v1/t/s');

        // 订单信息,这里定义为room更容易理解,每个订单对应一个room,每个room中有多个用户id且不重复
        var roomInfo = {};  // {roomID: [user1, user2, ...], ...}

        // 不经过数据库直接读写用户信息,内存读写速度快,且大幅减小数据库压力
        var userInfo = {};  // {userId: {userName: '', avatarUrl: ''}, ...}

        socketIO.on('connection', function (socket) {
            // 30秒后未进入房间则断开Socket连接
            /* 以后写 */
            
            // 记录用户是否已经进入房间
            var addedUser = false;

            // 加入的房间id
            var roomID = null;

            // 加入房间
            socket.on('join', function(_ordernumber, _session, _receiptfn) {

                var async = require("async");

                async.waterfall([
                    function(_callback) { // 校验参数
                        if ( !_ordernumber || !_session ) { 
                            _callback(9000, 'Socket参数不正确');
                        } else {
                            _callback(null);
                        }
                    },
                    function(_callback) { // 获取行程信息
                        TripModel.getTripInfo(_ordernumber, (err, userid, state, type, destination, tool, created_time) => {
                            if (!err) {
                                // 创建完成状态、正在进行状态、求救状态
                                if (state === 0 || state === 1 || state === 3) {
                                    roomID = _ordernumber;
                                    _callback(null, userid);
                                } else {
                                    _callback(9004, '行程已' + (state === 2 ? '结束' : '取消'));
                                }
                            } else {
                                _callback(9003, err);
                            }
                        });
                    },
                    function(authorUserid, _callback) { // 校验用户身份
                        UserModel.getUseridWithSession(_session, (err, userid) => {
                            if (!err) {
                                // 将用户id保存在socket的session中
                                socket.userid = userid;
                                socket.isAuthor = (userid === authorUserid);
                                _callback(null);
                            } else {
                                _callback(9001, '身份无效');
                            }
                        });
                    },
                    function(_callback) { // 获取用户信息
                        UserModel.getUserInfoWithUserid(socket.userid, (err, nickname, avatarURL, mobile, created, lastUpdated) => {
                            if (!err) {
                                socket.nickname = nickname;
                                socket.avatarURL = avatarURL;
                                _callback(null);
                            } else {
                                _callback(9002, '用户信息查询失败');
                            }
                        });
                    }
                ], function (err, result) {
                    if (err) { // 加入房间出错
                        if (_receiptfn) { _receiptfn(err, result); }
                        socket.emit('disconnect');
                        return false;
                    }

                    // 将用户加入房间名单中
                    if (!roomInfo[roomID]) {
                        roomInfo[roomID] = [];
                    }
                    if (!socket.isAuthor) {
                        var index = roomInfo[roomID].indexOf(socket.userid); //防止重复添加
                        if (index === -1) {
                            roomInfo[roomID].push(socket.userid);
                        }
                    }
                    // 添加到缓存
                    userInfo[socket.userid] = {nickname: socket.nickname, avatarURL: socket.avatarURL};
                    socket.join(roomID);  // 加入房间
                    // 广播
                    console.log(socket.userid, socket.isAuthor ? '已重新连接' : '进入' , roomID , '房间');
                    socketIO.to(roomID).emit('sys', socket.nickname + (socket.isAuthor ? '已重新连接' : '进入房间'));
                    socketIO.to(roomID).emit('user joined', {
                        nickname: socket.nickname,
                        avatarURL: socket.avatarURL,
                        isAuthor: socket.isAuthor,
                        users: roomInfo[roomID].map((_userid) => {
                            return {
                                nickname: userInfo[_userid]['nickname'],
                                avatarURL: userInfo[_userid]['avatarURL']
                            };
                        })
                    });
                    
                    // 标记已加入房间
                    addedUser = true;

                    // 调用回执函数
                    if (_receiptfn) { _receiptfn(); }

                    // 写入日志
                });
            });

            // 离开房间
            socket.on('leave', function () {
                socket.emit('disconnect');
            });

            socket.on('disconnect', function () {
                if (!addedUser) { return false; }

                // 移除房间内的用户
                if (!socket.isAuthor && roomInfo[roomID] && roomInfo[roomID].length > 0) { // 非房主成员移除(房主不在roomInfo中)
                    var index = roomInfo[roomID].indexOf(socket.userid);
                    if (index !== -1) {
                        roomInfo[roomID].splice(index, 1);
                    }
                }

                // 移除缓存中的用户信息
                if (userInfo.length > 0) {
                    var index = userInfo.indexOf(socket.userid);
                    if (index !== -1) {
                        userInfo.splice(index, 1);
                    }
                }

                socket.leave(roomID);  // 退出房间
                // 广播
                console.log(socket.userid, socket.isAuthor ? '已断开连接' : '离开', roomID, '房间');
                socketIO.to(roomID).emit('sys', socket.nickname + (socket.isAuthor ? '断开连接' : '离开房间'));
                //如果房间内还有人
                if (roomInfo[roomID] && roomInfo[roomID].length > 0) {
                    socketIO.to(roomID).emit('user left', {
                        nickname: socket.nickname,
                        avatarURL: socket.avatarURL,
                        isAuthor: socket.isAuthor,
                        users: roomInfo[roomID].map((_userid) => {
                            return {
                                nickname: userInfo[_userid]['nickname'],
                                avatarURL: userInfo[_userid]['avatarURL']
                            };
                        })
                    });
                }
                
                // 写入日志
            });

            // 接收位置信息
            socket.on('upload location', function(_session, _longitude, _latitude, _receiptfn) {
                
                var async = require("async");
                
                async.waterfall([
                    function(_callback){
                        // 验证登录状态
                        if (!addedUser) {
                            _callback(9001, '未登录');
                        } else {
                            _callback(null);
                        }
                    },
                    function(_callback){ // 校验参数
                        if ( !addedUser || !_session || !_longitude || !_latitude ) { 
                            _callback(9000, 'Socket参数不正确');
                        } else {
                            _callback(null);
                        }
                    },
                    function(_callback){
                        // 添加位置日志
                        TripAPIController.uploadTripLocation(_session, roomID, _longitude, _latitude, _callback);
                    }
                ], function (err, result) {
                    if (err) {
                        if (_receiptfn) { _receiptfn(err, result); }
                        return false;
                    }

                    // 如果房间内没有人,则不广播
                    if (roomInfo[roomID].length !== 0) {
                        socket.broadcast.to(roomID).emit('upload location', {longitude: _longitude, latitude: _latitude});
                    }
                    // 调用回执函数
                    if (_receiptfn) { _receiptfn(); }
                });
            });

            // 接收状态变更信息
            socket.on('change state', function (_session, _state, _receiptfn) {
                
                var async = require("async");

                async.waterfall([
                    function(_callback){
                        // 验证登录状态
                        if (!addedUser) {
                            _callback(9001, '未登录');
                        } else {
                            _callback(null);
                        }
                    },
                    function(_callback){
                        if ( !_session || !_state ) {
                            _callback(9000, 'Socket参数不正确');
                        } else {
                            _callback(null);
                        }
                    },
                    function(_callback){ // 修改状态
                        
                        // 状态对应函数
                        switch (Number(_state)) {
                            case 1: // 开始
                                TripAPIController.start(_session, roomID, _callback);
                                break;

                            case 2: // 结束
                                TripAPIController.stop(_session, roomID, _callback);
                                break;

                            case 3: // 发起求救
                                TripAPIController.startSOS(_session, roomID, _callback);
                                break;

                            case 4: // 取消行程
                                TripAPIController.cancel(_session, roomID, _callback);
                                break;

                            case 5: // 取消求救
                                TripAPIController.stopSOS(_session, roomID, _callback);
                                break;
                        
                            default:
                                _callback(9002, '无效操作');
                                break;
                        }
                    }
                ], function (err, result) {
                    if (err) {
                        if (_receiptfn) { _receiptfn(err, result); }
                        return false;
                    }

                    // 如果房间内没有人,则不广播
                    if (roomInfo[roomID].length !== 0) {
                        socket.broadcast.to(roomID).emit('change state', {state: _state});
                    }
                    // 调用回执函数
                    if (_receiptfn) { _receiptfn(); }
                });
            });
        });
    }
  };