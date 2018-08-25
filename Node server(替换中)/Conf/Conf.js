
module.exports = function () {
    DBConf = {
        connectionLimit : 100,
        connectTimeout: 10000,
        acquireTimeout: 10000,
        host     : 'localhost',
        user     : 'root',
        password : 'password',
        port     : '3306',
        database : 'an'
    };
    var mysql  = require('mysql');
    DBPool = mysql.createPool(DBConf);
    console.log('初始化数据库配置: ', DBConf);

    WXMPConf = {
        appid : 'wx_appid',
        secret : 'wx_secret'
    };
    console.log('初始化微信小程序配置: ', WXMPConf);
}