
var https=require('https');
var fs = require('fs');
var path = require('path')
var dayjs = require('dayjs')

module.exports = function(app, opts) {
  return new WeappPush(app, opts);
};

var DEFAULT_INTERVAL = 3000;

var WeappPush = function(app, opts) {
  this.app = app;
  this.interval = opts.interval || DEFAULT_INTERVAL;
  this.timerId = null;
  this.access_token = null;
  this.expires_in = 0;
  this.lastUpdateTime = dayjs();
};

WeappPush.name = '__WeappPush__';

WeappPush.prototype.start = function(cb) {
  console.log('weapp push components Start');
  var self = this;
  this.timerId = setInterval(function() {

    // 如果还未超过更新时间
    if (dayjs().diff(dayjs(self.lastUpdateTime), 'second') < self.expires_in) { return }

    console.log(self.app.getServerId() + ": get access_token start");

    var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../config/weapp.json'))).development;

    https.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential' + 
            '&appid=' + config.appid +
            '&secret=' + config.secret, function(_req,_res){  
        var responseData='';  
        _req.on('data',function(data){
            responseData += data;  
        });  
        _req.on('end',function(){  
            console.info(responseData);

            self.lastUpdateTime = dayjs();

            var parse = JSON.parse(responseData);
            if (!!parse.access_token) {
              self.access_token = parse.access_token;
              self.expires_in = parse.expires_in - 60; // 提前60秒请求,防止请求接口出错
            } else {
              console.error('get access_token error, errcode: ', parse.errcode, ', errmsg: ', parse.errmsg);
              self.expires_in = 0;
            }
        });
    });

    }, this.interval);
  process.nextTick(cb);
}

WeappPush.prototype.afterStart = function (cb) {
  console.log('weapp push components afterStart');
  process.nextTick(cb);
}

WeappPush.prototype.stop = function(force, cb) {
  console.log('weapp push components stop');
  clearInterval(this.timerId);
  process.nextTick(cb);
}

WeappPush.prototype.pushTripStartMessage = function (cb) {
  console.log('当前的access_token是: ', this.access_token);
  if (!this.access_token) {
    cb('access_token is null');
    return;
  }
  
  cb();
}

WeappPush.prototype.pushTripEndMessage = function (cb) {
  console.log('当前的access_token是: ', this.access_token);
  cb();
}

WeappPush.prototype.pushTripSOSMessage = function (cb) {
  console.log('当前的access_token是: ', this.access_token);
  cb();
}