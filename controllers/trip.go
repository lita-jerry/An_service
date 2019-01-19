package controllers

import (
	"An_service/models"
	// "encoding/json"
	"github.com/astaxie/beego"
)

// Operations about Users
type TripController struct {
	beego.Controller
}

// @Title Unfinished
// @Description get unfinished trip
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Success 200 {code: int, msg: string, ordernumber: string} get unfinished success
// @Failure 403 {code: int, msg: string} get unfinished fail
// @router /wxmp/unfinished [get]
func (t *TripController) Unfinished() {

	token := t.Ctx.Input.Header("auth-token")
	if token == "" {
		t.Data["json"] = map[string]interface{}{"code": -1, "msg": "token is nil."}
		t.ServeJSON()
		return
	}

	user, err := models.GetUserWithToken(token, 1)
	if err != nil {
		t.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		t.ServeJSON()
		return
	}

	ordernumber, err := models.GetUnfinishedTrip(user.Id)

	if err == nil {
		t.Data["json"] = map[string]interface{}{"code": 0, "msg": "get unfinished trip success.", "ordernumber": ordernumber}
	} else {
		t.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	}
	t.ServeJSON()
}

// @Title CreateTrip
// @Description create a new trip order
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Success 200 {code: int, msg: string, ordernumber: string} get unfinished success
// @Failure 403 {code: int, msg: string} create new trip order fail
// @router /wxmp/create [get]
func (t *TripController) Create() {

	token := t.Ctx.Input.Header("auth-token")
	if token == "" {
		t.Data["json"] = map[string]interface{}{"code": -1, "msg": "token is nil."}
		t.ServeJSON()
		return
	}

	user, err := models.GetUserWithToken(token, 1)
	if err != nil {
		t.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		t.ServeJSON()
		return
	}

	ordernumber, err := models.GetUnfinishedTrip(user.Id)
	if err != nil {
		t.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		t.ServeJSON()
		return
	} else if ordernumber != "" {
		t.Data["json"] = map[string]interface{}{"code": -1, "msg": "has unfinished trip"}
		t.ServeJSON()
		return
	}

	ordernumber, err = models.CreateTrip(user.Id)

	if err == nil {
		t.Data["json"] = map[string]interface{}{"code": 0, "msg": "get unfinished trip success.", "ordernumber": ordernumber}
	} else {
		t.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	}
	t.ServeJSON()
}

// @Title StopTrip
// @Description stop a trip order
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Success 200 {code: int, msg: string} stop a trip order success
// @Failure 403 {code: int, msg: string} stop a trip order fail
// @router /wxmp/stop [get]
func (this *TripController) Stop() {

	token := this.Ctx.Input.Header("auth-token")
	if token == "" {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "token is nil."}
		this.ServeJSON()
		return
	}

	ordernumber := this.GetString("ordernumber")
	if ordernumber == "" {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "ordernumber is nil."}
		this.ServeJSON()
		return
	}

	user, err := models.GetUserWithToken(token, 1)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}

	err = models.StopTrip(user.Id, ordernumber)

	if err == nil {
		this.Data["json"] = map[string]interface{}{"code": 0, "msg": "stop trip success."}
	} else {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	}
	this.ServeJSON()
}