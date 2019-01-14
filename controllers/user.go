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

	if err == nil {
		u.Data["json"] = map[string]interface{}{"code": 0, "msg": "login success.", "token": token}
	} else {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	}
	u.ServeJSON()
}
