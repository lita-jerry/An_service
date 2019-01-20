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
func (this *TripController) Unfinished() {

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

	ordernumber, err := models.GetUnfinishedTrip(user.Id)

	if err == nil {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "get unfinished trip success.", "ordernumber": ordernumber}
	} else {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	}
	this.ServeJSON()
}

// @Title CreateTrip
// @Description create a new trip order
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Success 200 {code: int, msg: string, ordernumber: string} get unfinished success
// @Failure 403 {code: int, msg: string} create new trip order fail
// @router /wxmp/create [get]
func (this *TripController) Create() {

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

	ordernumber, err := models.GetUnfinishedTrip(user.Id)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	} else if ordernumber != "" {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "has unfinished trip"}
		this.ServeJSON()
		return
	}

	ordernumber, err = models.CreateTrip(user.Id)

	if err == nil {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "get unfinished trip success.", "ordernumber": ordernumber}
	} else {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	}
	this.ServeJSON()
}

// @Title StopTrip
// @Description stop a trip order
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Param	ordernumber		query 	string	true		"The trip's ordernumber"
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
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "stop trip success."}
	} else {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	}
	this.ServeJSON()
}

// @Title GetTripInfo
// @Description get a trip info (last updated location)
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Param	ordernumber		query 	string	true		"The trip's ordernumber"
// @Success 200 {code: int, msg: string} get trip's info success
// @Failure 403 {code: int, msg: string} get trip's info fail
// @router /wxmp/info [get]
func (this *TripController) Info() {

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

	_, err := models.GetUserWithToken(token, 1)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}

	trip, err := models.GetTripInfo(ordernumber)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}

	location, err := models.GetTripLastUpdatedLocation(ordernumber)

	if err == nil {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "get trip info success.", "state": trip.State, "ctime": trip.CreatedTime, "lastlocation": map[string]interface{}{"time": location.CreatedTime, "longitude": location.Longitude, "latitude": location.Latitude}}
	} else {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	}
	this.ServeJSON()
}