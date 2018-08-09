# Node服务端

- [目录结构](#目录结构)<br>
- [数据库结构](#数据库结构)<br>
- [用户相关接口](#用户相关接口)<br>
- [行程相关接口](#行程相关接口)<br>

### 目录结构

```
├── Conf                               项目配置
│   ├── Conf.js                        参数配置文件
│
├── Util                               常用工具函数
│   ├── MySQL.js                       MySQL相关操作
│
├── User                               用户模块
│   ├── Router.js                      路由
│   ├── WXMPController.js              微信用户控制器
│   ├── Model.js                       数据模型
│   ├── util.js                        工具函数
│
├── Trip                               行程模块
│   ├── Router.js                      路由
│   ├── APIController.js               控制器
│   ├── Model.js                       数据模型
│   ├── util.js                        工具函数
```

### 数据库结构

user 用户表

| 字段名  |  注释  |  类型  |  Key  |  Null  |
| ------------ | ------------ | ------------ | ------------ | ------------ |
|  id  |  用户id  |  int(10) unsigned  |  PRI  |  NO  |
|  nick_name  |  昵称  |  char(32)  |    |  YES  |
|  avatar_url  |  用户头像url  |  char(64)  |    |  YES  |
|  mobile  |  手机号  |  char(16)  |    |  YES  |
|  created_time  |  发生时间  |  timestamp  |    |  NO  |
|  last_updated_time  |  最后更新时间  |  datetime  |    |  NO  |
<br>

user_bind 用户第三方绑定表

| 字段名  |  注释  |  类型  |  Key  |  Null  |
| ------------ | ------------ | ------------ | ------------ | ------------ |
|  id  |  记录id  |  int(10) unsigned  |  PRI  |  NO  |
|  user_id  |  用户id  |  int(11)  |    |  NO  |
|  type  |  绑定类型: <br>1, 微信小程序  |  int(11)  |    |  NO  |
|  open_id  |  所在平台的用户id  |  char(32)  |    |  NO  |
|  created_time  |  发生时间  |  timestamp  |    |  NO  |
|  last_updated_time  |  最后更新时间  |  datetime  |    |  NO  |
<br>

user_online_state 用户在线状态表

| 字段名  |  注释  |  类型  |  Key  |  Null  |
| ------------ | ------------ | ------------ | ------------ | ------------ |
|  id  |  记录id  |  int(10) unsigned  |  PRI  |  NO  |
|  user_id  |  用户id  |  int(11)  |  UNI  |  NO  |
|  type  |  登录类型: <br>1, 手机验证码; <br>2, 微信小程序  |  int(11)  |    |  NO  |
|  client_session  |  与客户端会话  |  char(32)  |  UNI  |  NO  |
|  server_session  |  与第三方服务端会话  |  char(64)  |    |  YES  |
|  created_time  |  发生时间  |  timestamp  |    |  NO  |
|  last_updated_time  |  最后更新时间  |  datetime  |    |  NO  |
<br>

mobile_sms_log 短信发送记录(弃)

| 字段名  |  注释  |  类型  |  Key  |  Null  |
| ------------ | ------------ | ------------ | ------------ | ------------ |
|  id  |  记录id  |  INTEGER  |  PRI  |  NO  |
|  user_id  |  用户id  |  INTEGER  |    |  YES  |
|  type  |  短信类型: <br>1, 绑定手机号;  |  INTEGER  |    |  NO  |
|  message  |  短信内容  |  CHAR(255)  |    |  NO  |
|  code  |  校验值  |  CHAR(8)  |    |  YES  |
|  created  |  发生时间  |  TIMESTAMP  |    |  NO  |
<br>

trip 行程订单列表

| 字段名  |  注释  |  类型  |  Key  |  Null  |
| ------------ | ------------ | ------------ | ------------ | ------------ |
|  id  |  记录id  |  int(10) unsigned  |  PRI  |  NO  |
|  order_number  |  订单编号  |  char(32)  |  UNI  |  NO  |
|  user_id  |  创建人的用户id  |  int(11)  |    |  NO  |
|  state  |  当前状态: <br>0, 已创建,还未开始行程(作废,将不会出现此种情况); <br>1, 行程正在进行; <br>2, 行程已经结束; <br>3, 失联(断线中);  |  int(11)  |    |  No  |
|  created_time  |  行程创建时间  |  timestamp  |    |  NO  |
|  last_updated_time  |  最后更新时间  |  datetime  |    |  NO  |
<br>

trip_logs 行程日志

| 字段名  |  注释  |  类型  |  Key  |  Null  |
| ------------ | ------------ | ------------ | ------------ | ------------ |
|  id  |  记录id  |  int(10) unsigned  |  PRI  |  NO  |
|  order_number  |  订单编号  |  char(32)  |    |  NO  |
|  event_type  |  事件类型: <br>1, Socket连接事件；<br>2, Socket断开事件；<br>3, 求救事件；  |  INTEGER  |    |  NO  |
|  operation  |  操作内容  |  char(255)  |    |  No  |
|  remark  |  备注  |  char(255)  |    |  YES  |
|  created_time  |  日志产生时间  |  timestamp  |    |  NO  |
<br>

trip_polyline 行程轨迹

| 字段名  |  注释  |  类型  |  Key  |  Null  |
| ------------ | ------------ | ------------ | ------------ | ------------ |
|  id  |  记录id  |  int(10) unsigned  |  PRI  |  NO  |
|  order_number  |  订单编号  |  char(32)  |    |  NO  |
|  longitude  |  经度  |  char(255)  |    |  NO  |
|  latitude  |  纬度  |  char(255)  |    |  No  |
|  remark  |  备注  |  char(255)  |    |  YES  |
|  created_time  |  日志产生时间  |  timestamp  |    |  NO  |
<br>

### 用户相关接口

获取绑定手机号短信验证码(需登录)(弃)

```
GET /user/getbindsmscode?session={session}&mobile={mobile}
```
间隔为60秒
 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  session  |  小程序与服务器会话session  |  String  |  是  |
|  mobile  |  需要绑定的手机号  |  String  |  是  |

 - 成功返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |

 - 失败/错误返回参数说明:

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码 非0  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//正常返回的JSON数据包
{
    "code": 0,
    "msg": "send success"
}

//错误时返回JSON数据包(示例为手机号码格式不正确)
{
    "code": -1,
    "msg": "手机号码格式不正确"
}
```
<br>

绑定用户手机号(弃)

```
GET /user/bindmobile?session={session}&mobile={mobile}&smscode={smscode}
```
间隔为60秒
 - 请求参数说明(需登录)

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  session  |  小程序与服务器会话session  |  String  |  是  |
|  mobile  |  需要绑定的手机号  |  String  |  是  |
|  smscode  |  短信验证码  |  String  |  是  |

 - 成功返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |

 - 失败/错误返回参数说明:

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码 非0  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//正常返回的JSON数据包
{
    "code": 0,
    "msg": "bind success"
}

//错误时返回JSON数据包(示例为手机号码格式不正确)
{
    "code": -1,
    "msg": "手机号码格式不正确"
}
```
<br>

微信小程序用户注册

```
GET /v1/u/wxmp/regist?code={code}&nickname={nickname}&avatarurl={avatarurl}
```

```seq
微信小程序->Node Server: 上传code、nickname、avatarurl
Node Server->WX Server: 提交code
WX Server-->Node Server: 返回session_key、openid
Note right of Node Server: 注册过程，流程见下图
Node Server->Node Server: 生成具有登录状态的session
Node Server-->微信小程序: 返回code、msg、session
```

```flow
st=>start: 注册
op=>operation: 接收session_key、openid
cond=>condition: 查询用户是否已经注册
up=>operation: 更新nickname、avatarurl
rg=>operation: 注册用户
e=>end: 登录、生成session

st->op->cond
cond(yes)->up->e
cond(no)->rg->e
```

 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  code  |  wx.login()获取的临时code  |  String  |  是  |
|  nickname  |  wx.getUserInfo()获取的用户昵称  |  String length < 32  |  是  |
|  avatarurl  |  wx.getUserInfo()获取的用户头像url  |  String length < 64  |  是  |

 - 成功返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |
|  session  |  小程序与服务器会话session  |  String  |

 - 失败/错误返回参数说明:

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码 非0  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//正常返回的JSON数据包
{
      "code": 0,
      "msg": "send success",
      "session": "SESSION"
}

//错误时返回JSON数据包(示例为Code无效)
{
    "code": -1,
    "msg": "Code无效"
}
```
<br>

微信小程序用户登录

> 每次启动微信小程序的时候执行自动登录用

```
GET /v1/u/wxmp/login?code={code}
```

```seq
微信小程序->Node Server: 上传code
Node Server->WX Server: 上传code
WX Server-->Node Server: 返回session_key、openid
Note right of Node Server: 根据openid查询用户,如未注册则返回错误
Node Server->Node Server: 生成具有登录状态的session
Node Server-->微信小程序: 返回code、msg、session
```

 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  code  |  wx.login()获取的临时code  |  String  |  是  |

 - 成功返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |
|  session  |  小程序与服务器会话session  |  String  |

 - 失败/错误返回参数说明:

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码 非0  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//正常返回的JSON数据包
{
      "code": 0,
      "msg": "登录成功",
      "session": "SESSION"
}

//错误时返回JSON数据包
{
    "code": -1,
    "msg": "Code无效"
}
```
<br>

微信小程序用户信息同步(需登录)

```
GET /v1/u/wxmp/info/update?session={session}&nickname={nickname}&avatarurl={avatarurl}
```

 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  session  |  小程序与服务器会话session  |  String  |  是  |
|  nickname  |  wx.getUserInfo()获取的用户昵称  |  String length < 32  |  是  |
|  avatarurl  |  wx.getUserInfo()获取的用户头像url  |  String length < 64  |  是  |

 - 成功返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |

 - 失败/错误返回参数说明:

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码 非0  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//正常返回的JSON数据包
{
    "code": 0,
    "msg": "update success"
}

//错误时返回JSON数据包
{
    "code": -1,
    "msg": "Session已过期"
}
```
<br>

### 行程相关接口

查询我未完成的订单(需登录)

```
GET /v1/t/unfinished?session={session}
```

 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  session  |  小程序与服务器会话session  |  String  |  是  |

 - 成功返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |
|  ordernumber  |  行程订单编号(如果有,null表示没有)  |  String  |

 - 失败/错误返回参数说明:

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码 非0  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//正常返回的JSON数据包
{
    "code": 0,
    "msg": "success",
	"ordernumber": "ordernumber"
}

//错误时返回JSON数据包
{
    "code": -1,
    "msg": "Session已过期"
}
```
<br>

创建行程(需登录，且当前无未完成的行程订单)

```
GET /v1/t/create?session={session}
```

 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  session  |  小程序与服务器会话session  |  String  |  是  |

 - 成功返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |
|  ordernumber  |  行程订单编号  |  String  |

 - 失败/错误返回参数说明:

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码 非0  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//正常返回的JSON数据包
{
    "code": 0,
    "msg": "success",
	"ordernumber": "ordernumber"
}

//错误时返回JSON数据包
{
    "code": -1,
    "msg": "Session已过期"
}
```
<br>

取消行程(需登录，且订单未开始前)

```
GET /v1/t/cancel?session={session}&ordernumber={ordernumber}
```

 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  session  |  小程序与服务器会话session  |  String  |  是  |
|  ordernumber  |  行程订单编号  |  String  |  是  |

 - 返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//返回的JSON数据包
{
    "code": 0,
    "msg": "success"
}
```
<br>

开始行程(需登录，且订单未开始前)

```
GET /v1/t/start?session={session}&ordernumber={ordernumber}
```

 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  session  |  小程序与服务器会话session  |  String  |  是  |
|  ordernumber  |  行程订单编号  |  String  |  是  |

 - 返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//返回的JSON数据包
{
    "code": 0,
    "msg": "success"
}
```
<br>

结束行程(需登录，且订单已经开始,包含求救状态)

```
GET /v1/t/stop?session={session}&ordernumber={ordernumber}
```

 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  session  |  小程序与服务器会话session  |  String  |  是  |
|  ordernumber  |  行程订单编号  |  String  |  是  |

 - 返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//返回的JSON数据包
{
    "code": 0,
    "msg": "success"
}
```
<br>

发出求救(需登录，且订单已经开始)

```
GET /v1/t/sos/start?session={session}&ordernumber={ordernumber}
```

 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  session  |  小程序与服务器会话session  |  String  |  是  |
|  ordernumber  |  行程订单编号  |  String  |  是  |

 - 返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//返回的JSON数据包
{
    "code": 0,
    "msg": "success"
}
```
<br>

解除求救(需登录，且订单处于求救状态)

```
GET /v1/t/sos/stop?session={session}&ordernumber={ordernumber}
```

 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  session  |  小程序与服务器会话session  |  String  |  是  |
|  ordernumber  |  行程订单编号  |  String  |  是  |

 - 返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//返回的JSON数据包
{
    "code": 0,
    "msg": "success"
}
```
<br>

获取行程信息(需登录，且订单已经开始,包含求救状态)

```
GET /v1/t/info/get?session={session}&ordernumber={ordernumber}
```

 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  session  |  小程序与服务器会话session  |  String  |  是  |
|  ordernumber  |  行程订单编号  |  String  |  是  |

 - 成功返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |
|  info  |  行程信息  |  Dictionary  |
|  info.type  |  行程类型:默认1  |  Int  |
|  info.destination  |  目的地  |  String  |
|  info.tool  |  搭乘工具  |  String  |
|  info.state  |  当前状态: <br>0, 已创建,还未开始行程; <br>1, 行程已开始,目前安全; <br>2, 已结束行程; <br>3, 发生危险; <br>4, 取消行程;  |  Int  |
|  info.created_time  |  创建时间  |  String  |

 - 失败/错误返回参数说明:

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码 非0  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//正常返回的JSON数据包
{
    "code": 0,
    "msg": "查询成功",
    "info": {
        "type": 1,
        "destination": null,
        "tool": null,
        "state": 1,
        "created_time": "2018-06-12T16:40:23.000Z"
    }
}

//错误时返回JSON数据包
{
    "code": -1,
    "msg": "Code无效"
}
```
<br>

更新行程信息(需登录，且订单未开始前)

```
GET /v1/t/info/update?session={session}&ordernumber={ordernumber}&destination={destination}&tool={tool}
```

 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  session  |  小程序与服务器会话session  |  String  |  是  |
|  ordernumber  |  行程订单编号  |  String  |  是  |
|  destination  |  目的地  |  String length < 32  |  是  |
|  tool  |  搭乘工具  |  String length < 32  |  是  |

 - 返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//返回的JSON数据包
{
    "code": 0,
    "msg": "success"
}
```
<br>

获取位置/行驶轨迹(需登录，且订单未开始前)

```
GET /v1/t/location/all?session={session}&ordernumber={ordernumber}
```

 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  session  |  小程序与服务器会话session  |  String  |  是  |
|  ordernumber  |  行程订单编号  |  String  |  是  |

 - 返回参数说明

| 参数名  |  解释  |  类型  |
| ------------ | ------------ | ------------ |
|  code  |  状态码  |  Int  |
|  msg  |  提示信息  |  String  |

 - 返回说明

```
//返回的JSON数据包
{
    "code": 0,
    "msg": "success"
}
```
<br>