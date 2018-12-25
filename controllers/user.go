package controllers

import (
	"An_service/models"
	"encoding/json"

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
// @Success 200 {string} regist success
// @Failure 403 regist fail
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

	token, err := models.Login(nickname, avatarurl, code)

	if err == nil {
		u.Data["json"] = map[string]interface{}{"code": 0, "msg": "login success.", "token": token}
	} else {
		u.Data["json"] = map[string]interface{}{"code": -1, "msg": "login fail."}
	}
	u.ServeJSON()
}

// @Title WXMPLogin 作废
// @Description Login WXMP User
// @Param	code		    query 	string	true		"The wx code for login"
// @Success 200 {string} login success
// @Failure 403 user not exist
// @router /wxmp/login [get]
// func (u *UserController) WXMPLogin() {
// 	// code := u.GetString("code")
// 	if true {
// 		u.Data["json"] = map[string]interface{}{"code": 0, "msg": "login success.", "token": "login token"}
// 	} else {
// 		u.Data["json"] = map[string]interface{}{"code": -1, "msg": "login fail."}
// 	}
// 	u.ServeJSON()
// }

// @Title WXMPInfoUpdate 作废
// @Description Update WXMP info
// @router /wxmp/info [post]
// func (u *UserController) WXMPInfoUpdate() {}

// @Title CreateUser
// @Description create users
// @Param	body		body 	models.User	true		"body for user content"
// @Success 200 {int} models.User.Id
// @Failure 403 body is empty
// @router / [post]
func (u *UserController) Post() {
	var user models.User
	json.Unmarshal(u.Ctx.Input.RequestBody, &user)
	uid := models.AddUser(user)
	u.Data["json"] = map[string]string{"uid": uid}
	u.ServeJSON()
}

// @Title GetAll
// @Description get all Users
// @Success 200 {object} models.User
// @router / [get]
func (u *UserController) GetAll() {
	users := models.GetAllUsers()
	u.Data["json"] = users
	u.ServeJSON()
}

// @Title Get
// @Description get user by uid
// @Param	uid		path 	string	true		"The key for staticblock"
// @Success 200 {object} models.User
// @Failure 403 :uid is empty
// @router /:uid [get]
func (u *UserController) Get() {
	uid := u.GetString(":uid")
	if uid != "" {
		user, err := models.GetUser(uid)
		if err != nil {
			u.Data["json"] = err.Error()
		} else {
			u.Data["json"] = user
		}
	}
	u.ServeJSON()
}

// @Title Update
// @Description update the user
// @Param	uid		path 	string	true		"The uid you want to update"
// @Param	body		body 	models.User	true		"body for user content"
// @Success 200 {object} models.User
// @Failure 403 :uid is not int
// @router /:uid [put]
func (u *UserController) Put() {
	uid := u.GetString(":uid")
	if uid != "" {
		var user models.User
		json.Unmarshal(u.Ctx.Input.RequestBody, &user)
		uu, err := models.UpdateUser(uid, &user)
		if err != nil {
			u.Data["json"] = err.Error()
		} else {
			u.Data["json"] = uu
		}
	}
	u.ServeJSON()
}

// @Title Delete
// @Description delete the user
// @Param	uid		path 	string	true		"The uid you want to delete"
// @Success 200 {string} delete success!
// @Failure 403 uid is empty
// @router /:uid [delete]
func (u *UserController) Delete() {
	uid := u.GetString(":uid")
	models.DeleteUser(uid)
	u.Data["json"] = "delete success!"
	u.ServeJSON()
}

// @Title Login
// @Description Logs user into the system
// @Param	username		query 	string	true		"The username for login"
// @Param	password		query 	string	true		"The password for login"
// @Success 200 {string} login success
// @Failure 403 user not exist
// @router /login [get]
// func (u *UserController) Login() {
// 	username := u.GetString("username")
// 	password := u.GetString("password")
// 	if models.Login(username, password) {
// 		u.Data["json"] = "login success"
// 	} else {
// 		u.Data["json"] = "user not exist"
// 	}
// 	u.ServeJSON()
// }

// @Title logout
// @Description Logs out current logged in user session
// @Success 200 {string} logout success
// @router /logout [get]
func (u *UserController) Logout() {
	u.Data["json"] = "logout success"
	u.ServeJSON()
}
