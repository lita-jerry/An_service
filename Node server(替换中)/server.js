console.log('这里是: ', process.env.NODE_APP_INSTANCE);
var express = require('express');
var path = require('path');
var router = express.Router();

var app = express();
var server = require('http').Server(app);
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// 定义全局变量
require('./Conf/Conf')();

// 配置接口路由地址
app.use('/v1/u/', require('./User/Router'));
app.use('/v1/t/', require('./Trip/Router'));

// api test page
router.get('/v1', function (req, res) {
  
    // 渲染页面数据(见views/room.hbs)
    res.render('v1api');
});
app.use('/', router);

// 启动接口服务
server.listen((8081 + Number(process.env.NODE_APP_INSTANCE)), function(){
    var host = server.address().address
    var port = server.address().port

    console.log('http://%s:%s', host, port)
})

// 启动行程订单Socket服务
require('./Trip/SocketController').startSocketServer(server, (socketServer) => {
    if (socketServer) {
        // console.log(socketServer);
        console.log('ScoketIO启动成功');
    }
});