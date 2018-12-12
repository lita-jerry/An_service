# Node服务端

- [目录结构](#目录结构)<br>
- [数据库结构](#数据库结构)<br>
- [用户相关接口](#用户相关接口)<br>
- [行程相关接口](#行程相关接口)<br>

### 目录结构(作废)

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
|  id  |  用户id  |  INTEGER unsigned  |  PRI  |  NO  |
|  nick_name  |  昵称  |  CHAR(64)  |    |  YES  |
|  avatar_url  |  用户头像url  |  CHAR(255)  |    |  YES  |
|  state  |  用户状态: <br>1=正常; <br>3=封禁;  |  INTEGER  |    |  NO  |
|  created_time  |  发生时间  |  TIMESTAMP  |    |  NO  |
|  last_updated_time  |  最后更新时间  |  DATETIME  |    |  NO  |
<br>

user_bind 用户第三方绑定表

| 字段名  |  注释  |  类型  |  Key  |  Null  |
| ------------ | ------------ | ------------ | ------------ | ------------ |
|  id  |  记录id  |  int(10) unsigned  |  PRI  |  NO  |
|  user_id  |  用户id  |  int(11)  |    |  NO  |
|  platform  |  绑定平台: <br>1, 微信小程序  |  int(11)  |    |  NO  |
|  open_id  |  所在平台的用户id  |  char(32)  |    |  NO  |
|  created_time  |  发生时间  |  timestamp  |    |  NO  |
|  last_updated_time  |  最后更新时间  |  datetime  |    |  NO  |
<br>

user_online_state 用户在线状态表

| 字段名  |  注释  |  类型  |  Key  |  Null  |
| ------------ | ------------ | ------------ | ------------ | ------------ |
|  id  |  记录id  |  int(10) unsigned  |  PRI  |  NO  |
|  user_id  |  用户id  |  int(11)  |  UNI  |  NO  |
|  platform  |  登录平台: <br>1, 微信小程序  |  INTEGER  |    |  NO  |
|  state  |  状态: <br>1, 生效中; <br>2, 过期  |  INTEGER  |    |  NO  |
|  client_token  |  客户端token  |  char(32)  |  UNI  |  NO  |
|  session_key  |  与第三方服务端会话  |  char(64)  |    |  YES  |
|  created_time  |  发生时间  |  timestamp  |    |  NO  |
|  last_updated_time  |  最后更新时间  |  datetime  |    |  NO  |
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

微信小程序用户注册

```
GET /v1/user/wxmp/regist?code={code}&nickname={nickname}&avatarurl={avatarurl}
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
|  token  |  登录token  |  String  |

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
      "msg": "login success.",
      "token": "login token"
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
GET /v1/user/wxmp/login?code={code}
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
|  token  |  登录token  |  String  |

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
      "token": "login token"
}

//错误时返回JSON数据包
{
    "code": -1,
    "msg": "Code无效"
}
```
<br>

微信小程序用户信息更新(需登录)

```
POST /v1/user/wxmp/info
```

 - 请求参数说明

| 参数名  |  解释  |  类型  |  必填  |
| ------------ | ------------ | ------------ | ------------ |
|  token  |  登录token  |  String  |  是  |
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
    "msg": "Token已过期"
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