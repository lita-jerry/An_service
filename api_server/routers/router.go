// @APIVersion 1.0.0
// @Title beego Test API
// @Description beego has a very cool tools to autogenerate documents for your API
// @Contact astaxie@gmail.com
// @TermsOfServiceUrl http://beego.me/
// @License Apache 2.0
// @LicenseUrl http://www.apache.org/licenses/LICENSE-2.0.html
package routers

import (
	"An_Server/api_server/controllers"

	"github.com/astaxie/beego"
)

func init() {
	ns := beego.NewNamespace("/v1",

		beego.NSNamespace("/mobile_sms_log",
			beego.NSInclude(
				&controllers.MobileSmsLogController{},
			),
		),

		beego.NSNamespace("/trip",
			beego.NSInclude(
				&controllers.TripController{},
			),
		),

		beego.NSNamespace("/trip_logs",
			beego.NSInclude(
				&controllers.TripLogsController{},
			),
		),

		beego.NSNamespace("/trip_polyline",
			beego.NSInclude(
				&controllers.TripPolylineController{},
			),
		),

		beego.NSNamespace("/user",
			beego.NSInclude(
				&controllers.UserController{},
			),
		),

		beego.NSNamespace("/user_bind",
			beego.NSInclude(
				&controllers.UserBindController{},
			),
		),

		beego.NSNamespace("/user_follow_relation",
			beego.NSInclude(
				&controllers.UserFollowRelationController{},
			),
		),

		beego.NSNamespace("/user_online_state",
			beego.NSInclude(
				&controllers.UserOnlineStateController{},
			),
		),
	)
	beego.AddNamespace(ns)
}
