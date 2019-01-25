package controllers

import (
	"An_service/models"
	"github.com/astaxie/beego"
	"errors"
)

// Operations about Users
type UserController struct {
	beego.Controller
}

// @Title WXMPLogin
// @Description WXMP user login
// @Param	code		    query 	string	true		"The wx code for login"
// @Param	nickname		query 	string	true		"The user's nickname"
// @Param	avatarurl		query 	string	true		"The user's avatarurl"
// @Success 200 {code: int, msg: string, token: string} regist success
// @Failure 403 {code: int, msg: string} regist fail
// @router /wxmp/login [get]
func (this *UserController) WXMPLogin() {

	code := this.GetString("code")
	if code == "" {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "code is nil."}
		this.ServeJSON()
		return
	}
	nickname := this.GetString("nickname")
	if nickname == "" {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "nickname is nil."}
		this.ServeJSON()
		return
	}
	avatarurl := this.GetString("avatarurl")
	if avatarurl == "" {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "avatarurl is nil."}
		this.ServeJSON()
		return
	}

	token, err := models.WXMPLogin(nickname, avatarurl, code)

	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	} else {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "login success.", "token": token}
	}
	this.ServeJSON()
}

// @Title GetFollowState
// @Description get follow state
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Success 200 {code: int, msg: string, isfollow: string} get follow state success
// @Failure 403 {code: int, msg: string} get follow state fail
// @router /wxmp/follow/state [get]
func (this *UserController) GetFollowState() {
	token := this.Ctx.Input.Header("auth-token")
	if token == "" {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "token is nil."}
		this.ServeJSON()
		return
	}

	toUserId := 0
	toUserId, err := this.GetInt("uid")
	if err != nil || toUserId == 0 {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "uid is nil."}
		this.ServeJSON()
		return
	}

	user, err := models.GetUserWithToken(token, 1)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}

	if user.Id == toUserId {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "不能关注自己"}
		this.ServeJSON()
		return
	}

	isFollow, isBoth, err := models.GetFollowState(user.Id, toUserId)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	} else {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "", "isfollow": isFollow, "isboth": isBoth}
	}
	this.ServeJSON()
}

// @Title AddFollow
// @Description add follow
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Success 200 {code: int, msg: string} add follow success
// @Failure 403 {code: int, msg: string} add follow fail
// @router /wxmp/follow/add [get]
func (this *UserController) AddFollow() {
	token := this.Ctx.Input.Header("auth-token")
	if token == "" {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "token is nil."}
		this.ServeJSON()
		return
	}

	toUserId := 0
	toUserId, err := this.GetInt("uid")
	if err != nil || toUserId == 0 {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "uid is nil."}
		this.ServeJSON()
		return
	}

	user, err := models.GetUserWithToken(token, 1)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}

	if user.Id == toUserId {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "不能关注自己"}
		this.ServeJSON()
		return
	}

	isFollow, _, err := models.GetFollowState(user.Id, toUserId)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	} else if isFollow {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "已经关注过了"}
		this.ServeJSON()
		return
	}
	
	err = models.AddFollow(user.Id, toUserId)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	} else {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "已关注"}
	}
	this.ServeJSON()
}

// @Title RemoveFollow
// @Description remove follow
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Success 200 {code: int, msg: string} remove follow success
// @Failure 403 {code: int, msg: string} remove follow fail
// @router /wxmp/follow/remove [get]
func (this *UserController) RemoveFollow() {
	token := this.Ctx.Input.Header("auth-token")
	if token == "" {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "token is nil."}
		this.ServeJSON()
		return
	}

	toUserId := 0
	toUserId, err := this.GetInt("uid")
	if err != nil || toUserId == 0 {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "uid is nil."}
		this.ServeJSON()
		return
	}

	user, err := models.GetUserWithToken(token, 1)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}

	if user.Id == toUserId {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "不能关注自己"}
		this.ServeJSON()
		return
	}

	isFollow, isBoth, err := models.GetFollowState(user.Id, toUserId)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	} else if !isFollow {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "还未关注"}
		this.ServeJSON()
		return
	}
	
	err = models.RemoveFollow(user.Id, toUserId, isBoth)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	} else {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "已取消关注"}
	}
	this.ServeJSON()
}

// @Title GetAllFollower
// @Description get all follower
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Success 200 {code: int, msg: string} get all follower success
// @Failure 403 {code: int, msg: string} get all follower fail
// @router /wxmp/follow/follower [get]
func (this *UserController) GetAllFollower() {
	token := this.Ctx.Input.Header("auth-token")
	if token == "" {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "token is nil."}
		this.ServeJSON()
		return
	}

	user, err := models.GetUserWithToken(token, 1)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}

	followers, err := models.GetAllFollower(user.Id)

	if len(followers) == 0 {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "没有任何人关注您", "followers": []}
		this.ServeJSON()
		return
	}

	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}
	userIdList := []int{}
	for _, follower := range followers {
		userIdList = append(userIdList, follower.FromUserId)
	}
	userList, err := models.GetUserList(userIdList)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}

	followersMap := []map[string]interface{}{}
	for i, follower := range followers {
		if userList[i].Id != follower.FromUserId {
			err = errors.New("Get user list error!")
			break
		}
		followersMap = append(followersMap, map[string]interface{}{
			"userid":    follower.Id,
			"nickname":  userList[i].NickName.String,
			"avatarurl": userList[i].AvatarUrl.String,
			"isboth":    follower.BothStatus})
	}

	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	} else {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "获取所有关注者请求成功", "followers": followersMap}
	}
	this.ServeJSON()
}

// @Title GetAllFollowing
// @Description get all following
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Success 200 {code: int, msg: string} get all following success
// @Failure 403 {code: int, msg: string} get all following fail
// @router /wxmp/follow/following [get]
func (this *UserController) GetAllFollowing() {
	token := this.Ctx.Input.Header("auth-token")
	if token == "" {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "token is nil."}
		this.ServeJSON()
		return
	}

	user, err := models.GetUserWithToken(token, 1)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}

	followings, err := models.GetAllFollowing(user.Id)

	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}

	if len(followings) == 0 {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "还没有关注任何人", "following": []}
		this.ServeJSON()
		return
	}

	userIdList := []int{}
	for _, following := range followings {
		userIdList = append(userIdList, following.ToUserId)
	}
	userList, err := models.GetUserList(userIdList)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}

	followingsMap := []map[string]interface{}{}
	for i, following := range followings {
		if userList[i].Id != following.ToUserId {
			err = errors.New("Get user list error!")
			break
		}
		followingsMap = append(followingsMap, map[string]interface{}{
			"userid":    following.Id,
			"nickname":  userList[i].NickName.String,
			"avatarurl": userList[i].AvatarUrl.String,
			"isboth":    following.BothStatus})
	}

	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	} else {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "获取所有已关注请求成功", "following": followingsMap}
	}
	this.ServeJSON()
}

// @Title CheckLoginToken
// @Description check login token
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Success 200 {code: int, msg: string} login token is effective
// @Failure 403 {code: int, msg: string} login token is not effective
// @router /wxmp/check [get]
func (this *UserController) CheckLoginToken() {
	token := this.Ctx.Input.Header("auth-token")
	if token == "" {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "token is nil."}
		this.ServeJSON()
		return
	}

	_, err := models.GetUserWithToken(token, 1)

	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	} else {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "Token有效"}
	}
	this.ServeJSON()
}