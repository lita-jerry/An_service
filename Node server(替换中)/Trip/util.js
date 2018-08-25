
/**
 * 制作行程订单编号
 */
var makeTripOrderNumber = function() {
    // var len = len || 8;
    // var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    // var len = 8;
    // var $chars = '1234567890';
    // var maxPos = $chars.length;
    // var pwd = '';
    // for (var i = 0; i < len; i++) {
    //     //0~32的整数
    //     pwd += $chars.charAt(Math.floor(Math.random() * (maxPos+1)));
    // }

    var len = 8;
    var Num=""; 
    for(var i = 0; i < len;i++) 
    { 
        Num += Math.floor(Math.random()*10); 
    } 

    return require('moment')().format("YYYYMMDDhhmmss") + Num;
}


exports.makeTripOrderNumber = makeTripOrderNumber;