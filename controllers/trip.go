package controllers

import (
	"An_service/models"
	// "encoding/json"
	"github.com/astaxie/beego"
	// "errors"
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

// @Title GetTripPolyline
// @Description get trip polyline
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Param	ordernumber		query 	string	true 	"The trip ordernumber"
// @Param	pageno 			query 	int		true 	"Get the page of No."
// @Param	pagesize 		query 	int		true 	"Get the page of size"
// @Success 200 {code: int, msg: string} get trip polyline success
// @Failure 403 {code: int, msg: string} get trip polyline fail
// @router /wxmp/polyline [get]
func (this *TripController) GetTripPolyline() {
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

	pageno, err := this.GetInt("pageno")
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "pageno is nil."}
		this.ServeJSON()
		return
	}

	pagesize, err := this.GetInt("pagesize")
	if err != nil || pagesize == 0 {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "pagesize is nil."}
		this.ServeJSON()
		return
	}

	_, err = models.GetUserWithToken(token, 1)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}

	polyline, err := models.GetTripPolyline(ordernumber, pageno, pagesize)

	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}

	polylineMap := []map[string]interface{}{}
	for _, location := range polyline {
		polylineMap = append(polylineMap, map[string]interface{}{
			"longitude": location.Longitude,
			"latitude": location.Latitude,
			"time": location.CreatedTime})
	}

	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	} else {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "获取行程路线成功", "polyline": polylineMap}
	}
	this.ServeJSON()
}

// @Title GetAllFinishedTrip
// @Description get all finished trip
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Success 200 {code: int, msg: string} get all finished trip success
// @Failure 403 {code: int, msg: string} get all finished trip fail
// @router /wxmp/finished [get]
func (this *TripController) GetAllFinishedTrip() {
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

	finished, err := models.GetFinishedTrip(user.Id)

	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}

	finishedMap := []map[string]interface{}{}
	for _, trip := range finished {
		finishedMap = append(finishedMap, map[string]interface{}{
			"ordernumber": trip.OrderNumber,
			"ctime": trip.CreatedTime,
			"stime": trip.LastUpdatedTime})
	}

	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	} else {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "获取行程路线成功", "data": finishedMap}
	}
	this.ServeJSON()
}

// @Title UpdateCurrentLocation
// @Description update current location
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Param	ordernumber		query 	string	true 	"The trip ordernumber"
// @Param	longitude		query 	string	true 	"Longitude of current location"
// @Param	latitude		query 	string	true 	"Latitude  of current location"
// @Success 200 {code: int, msg: string} updated current location success
// @Failure 403 {code: int, msg: string} updated current location fail
// @router /wxmp/update [get]
func (this *TripController) UpdateCurrentLocation() {
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

	longitude := this.GetString("longitude")
	if longitude == "" {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "longitude is nil."}
		this.ServeJSON()
		return
	}

	latitude := this.GetString("latitude")
	if latitude == "" {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "latitude is nil."}
		this.ServeJSON()
		return
	}

	user, err := models.GetUserWithToken(token, 1)
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
	if user.Id != trip.UserId {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "您无权限操作该行程"}
		this.ServeJSON()
		return
	}
	if trip.State == 2 {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "该行程已结束"}
		this.ServeJSON()
		return
	}

	err = models.UpdateCurrentLocation(ordernumber, longitude, latitude, "")

	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	} else {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "updated current location success"}
	}
	this.ServeJSON()
}

// @Title SendForSOS
// @Description send for SOS
// @Param	Headers{"auth-token"} 	query 	string	true 	"The user login token"
// @Param	ordernumber		query 	string	true 	"The trip ordernumber"
// @Success 200 {code: int, msg: string} send for SOS success
// @Failure 403 {code: int, msg: string} send for SOS fail
// @router /wxmp/sos [get]
func (this *TripController) SendForSOS() {
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

	trip, err := models.GetTripInfo(ordernumber)
	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
		this.ServeJSON()
		return
	}
	if user.Id != trip.UserId {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "您无权限操作该行程"}
		this.ServeJSON()
		return
	}
	if trip.State == 2 {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": "该行程已结束"}
		this.ServeJSON()
		return
	}

	err = models.SendForSOS(ordernumber)

	if err != nil {
		this.Data["json"] = map[string]interface{}{"code": -1, "msg": err.Error()}
	} else {
		this.Data["json"] = map[string]interface{}{"code": 200, "msg": "send for SOS success"}
	}
	this.ServeJSON()
}
