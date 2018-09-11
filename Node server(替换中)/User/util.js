
/**
 * 制作用户在线状态的Session串
 */
var makeOnlineSession = function() {
    _session = '' + Date.now() + Math.random()

    var crypto = require('crypto');  //加载crypto库
    //console.log(crypto.getHashes()); //打印支持的hash算法

    var md5 = crypto.createHash('md5');//定义加密方式:md5不可逆,此处的md5可以换成任意hash加密的方法名称；
    md5.update(_session);
    var session = md5.digest('hex');  //加密后的值d
    console.log("makeOnlineSession value: " + session);

    return session;
};


/**
 * 将微信小程序客户端登录code提交至微信服务器获取openid、session_key
 * 
 * @param {String} code 
 * @param {(err: String, openid: String, session_key: String)} callback 
 */
var getWXMPSession = function(code, callback) {
    var https=require('https');  
    https.get('https://api.weixin.qq.com/sns/jscode2session' + 
            '?appid=' + WXMPConf.appid +
            '&secret=' + WXMPConf.secret +
            '&js_code=' + code + 
            '&grant_type=' + 'authorization_code',function(_req,_res){  
        var responseData='';
        _req.on('data',function(data){
            responseData+=data;  
        });  
        _req.on('end',function(){  
            console.info(responseData);

            var parse = JSON.parse(responseData);

            if (callback) {
                if (parse.errcode != null) {
                    callback('wxcode:'+parse.errcode+' wxmsg:'+parse.errmsg, null, null);
                }else{
                    callback(null, parse.openid, parse.session_key);
                }
            }
        });  
    });
}

// 校验手机号格式
function checkMobile(mobile) {
    var mobileReg=/^[1][3,4,5,7,8][0-9]{9}$/;
    return mobileReg.test(mobile);
}

exports.makeOnlineSession = makeOnlineSession;
exports.getWXMPSession = getWXMPSession;