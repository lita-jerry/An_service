package controllers

import (
	"An_service/models"
	"github.com/astaxie/beego"
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
func (u *UserController) WXMPLogin() {

	code := u.GetString("code")
	if code == "" {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": "code is nil."}
		u.ServeJSON()
		return
	}
	nickname := u.GetString("nickname")
	if nickname == "" {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": "nickname is nil."}
		u.ServeJSON()
		return
	}
	avatarurl := u.GetString("avatarurl")
	if avatarurl == "" {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": "avatarurl is nil."}
		u.ServeJSON()
		return
	}

	token, err := models.WXMPLogin(nickname, avatarurl, code)

	if err != nil {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	} else {
		u.Data["json"] = map[string]interface{}{"code": 200, "msg": "login success.", "token": token}
	}
	u.ServeJSON()
}

// @Title GetFollowState
// @Description get follow state
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Success 200 {code: int, msg: string, isfollow: string} get follow state success
// @Failure 403 {code: int, msg: string} get follow state fail
// @router /wxmp/follow/state [get]
func (u *TripController) GetFollowState() {
	token := u.Ctx.Input.Header("auth-token")
	if token == "" {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": "token is nil."}
		u.ServeJSON()
		return
	}

	toUserId := 0
	toUserId, err := u.GetInt("uid")
	if err != nil || toUserId == 0 {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": "uid is nil."}
		u.ServeJSON()
		return
	}

	user, err := models.GetUserWithToken(token, 1)
	if err != nil {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		u.ServeJSON()
		return
	}

	isFollow, err := models.GetFollowState(user.Id, toUserId)
	if err != nil {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	} else {
		u.Data["json"] = map[string]interface{}{"code": 200, "msg": "", "isfollow": isFollow}
	}
	u.ServeJSON()
}

// @Title AddFollow
// @Description add follow
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Success 200 {code: int, msg: string} add follow success
// @Failure 403 {code: int, msg: string} add follow fail
// @router /wxmp/follow/add [get]
func (u *TripController) AddFollow() {
	token := u.Ctx.Input.Header("auth-token")
	if token == "" {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": "token is nil."}
		u.ServeJSON()
		return
	}

	toUserId := 0
	toUserId, err := u.GetInt("uid")
	if err != nil || toUserId == 0 {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": "uid is nil."}
		u.ServeJSON()
		return
	}

	user, err := models.GetUserWithToken(token, 1)
	if err != nil {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		u.ServeJSON()
		return
	}

	isFollow, err := models.GetFollowState(user.Id, toUserId)
	if err != nil {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		u.ServeJSON()
		return
	} else if isFollow {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": "已经关注过了"}
		u.ServeJSON()
		return
	}
	
	err = models.AddFollow(user.Id, toUserId)
	if err != nil {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	} else {
		u.Data["json"] = map[string]interface{}{"code": 200, "msg": "已关注"}
	}
	u.ServeJSON()
}