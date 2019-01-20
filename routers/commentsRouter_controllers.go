package routers

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/context/param"
)

func init() {

    beego.GlobalControllerRouter["An_service/controllers:ObjectController"] = append(beego.GlobalControllerRouter["An_service/controllers:ObjectController"],
        beego.ControllerComments{
            Method: "Post",
            Router: `/`,
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:ObjectController"] = append(beego.GlobalControllerRouter["An_service/controllers:ObjectController"],
        beego.ControllerComments{
            Method: "GetAll",
            Router: `/`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:ObjectController"] = append(beego.GlobalControllerRouter["An_service/controllers:ObjectController"],
        beego.ControllerComments{
            Method: "Get",
            Router: `/:objectId`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:ObjectController"] = append(beego.GlobalControllerRouter["An_service/controllers:ObjectController"],
        beego.ControllerComments{
            Method: "Put",
            Router: `/:objectId`,
            AllowHTTPMethods: []string{"put"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:ObjectController"] = append(beego.GlobalControllerRouter["An_service/controllers:ObjectController"],
        beego.ControllerComments{
            Method: "Delete",
            Router: `/:objectId`,
            AllowHTTPMethods: []string{"delete"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:TripController"] = append(beego.GlobalControllerRouter["An_service/controllers:TripController"],
        beego.ControllerComments{
            Method: "Create",
            Router: `/wxmp/create`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:TripController"] = append(beego.GlobalControllerRouter["An_service/controllers:TripController"],
        beego.ControllerComments{
            Method: "AddFollow",
            Router: `/wxmp/follow/add`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:TripController"] = append(beego.GlobalControllerRouter["An_service/controllers:TripController"],
        beego.ControllerComments{
            Method: "GetAllFollower",
            Router: `/wxmp/follow/follower`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:TripController"] = append(beego.GlobalControllerRouter["An_service/controllers:TripController"],
        beego.ControllerComments{
            Method: "GetAllFollowing",
            Router: `/wxmp/follow/following`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:TripController"] = append(beego.GlobalControllerRouter["An_service/controllers:TripController"],
        beego.ControllerComments{
            Method: "RemoveFollow",
            Router: `/wxmp/follow/remove`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:TripController"] = append(beego.GlobalControllerRouter["An_service/controllers:TripController"],
        beego.ControllerComments{
            Method: "GetFollowState",
            Router: `/wxmp/follow/state`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:TripController"] = append(beego.GlobalControllerRouter["An_service/controllers:TripController"],
        beego.ControllerComments{
            Method: "Info",
            Router: `/wxmp/info`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:TripController"] = append(beego.GlobalControllerRouter["An_service/controllers:TripController"],
        beego.ControllerComments{
            Method: "GetTripPolyline",
            Router: `/wxmp/polyline`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:TripController"] = append(beego.GlobalControllerRouter["An_service/controllers:TripController"],
        beego.ControllerComments{
            Method: "Stop",
            Router: `/wxmp/stop`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:TripController"] = append(beego.GlobalControllerRouter["An_service/controllers:TripController"],
        beego.ControllerComments{
            Method: "Unfinished",
            Router: `/wxmp/unfinished`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_service/controllers:UserController"] = append(beego.GlobalControllerRouter["An_service/controllers:UserController"],
        beego.ControllerComments{
            Method: "WXMPLogin",
            Router: `/wxmp/login`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

}
