package routers

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/context/param"
)

func init() {

    beego.GlobalControllerRouter["An_Server/api_server/controllers:MobileSmsLogController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:MobileSmsLogController"],
        beego.ControllerComments{
            Method: "Post",
            Router: `/`,
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:MobileSmsLogController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:MobileSmsLogController"],
        beego.ControllerComments{
            Method: "GetAll",
            Router: `/`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:MobileSmsLogController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:MobileSmsLogController"],
        beego.ControllerComments{
            Method: "GetOne",
            Router: `/:id`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:MobileSmsLogController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:MobileSmsLogController"],
        beego.ControllerComments{
            Method: "Put",
            Router: `/:id`,
            AllowHTTPMethods: []string{"put"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:MobileSmsLogController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:MobileSmsLogController"],
        beego.ControllerComments{
            Method: "Delete",
            Router: `/:id`,
            AllowHTTPMethods: []string{"delete"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripController"],
        beego.ControllerComments{
            Method: "Post",
            Router: `/`,
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripController"],
        beego.ControllerComments{
            Method: "GetAll",
            Router: `/`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripController"],
        beego.ControllerComments{
            Method: "GetOne",
            Router: `/:id`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripController"],
        beego.ControllerComments{
            Method: "Put",
            Router: `/:id`,
            AllowHTTPMethods: []string{"put"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripController"],
        beego.ControllerComments{
            Method: "Delete",
            Router: `/:id`,
            AllowHTTPMethods: []string{"delete"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripLogsController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripLogsController"],
        beego.ControllerComments{
            Method: "Post",
            Router: `/`,
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripLogsController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripLogsController"],
        beego.ControllerComments{
            Method: "GetAll",
            Router: `/`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripLogsController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripLogsController"],
        beego.ControllerComments{
            Method: "GetOne",
            Router: `/:id`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripLogsController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripLogsController"],
        beego.ControllerComments{
            Method: "Put",
            Router: `/:id`,
            AllowHTTPMethods: []string{"put"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripLogsController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripLogsController"],
        beego.ControllerComments{
            Method: "Delete",
            Router: `/:id`,
            AllowHTTPMethods: []string{"delete"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripPolylineController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripPolylineController"],
        beego.ControllerComments{
            Method: "Post",
            Router: `/`,
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripPolylineController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripPolylineController"],
        beego.ControllerComments{
            Method: "GetAll",
            Router: `/`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripPolylineController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripPolylineController"],
        beego.ControllerComments{
            Method: "GetOne",
            Router: `/:id`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripPolylineController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripPolylineController"],
        beego.ControllerComments{
            Method: "Put",
            Router: `/:id`,
            AllowHTTPMethods: []string{"put"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:TripPolylineController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:TripPolylineController"],
        beego.ControllerComments{
            Method: "Delete",
            Router: `/:id`,
            AllowHTTPMethods: []string{"delete"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserBindController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserBindController"],
        beego.ControllerComments{
            Method: "Post",
            Router: `/`,
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserBindController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserBindController"],
        beego.ControllerComments{
            Method: "GetAll",
            Router: `/`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserBindController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserBindController"],
        beego.ControllerComments{
            Method: "GetOne",
            Router: `/:id`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserBindController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserBindController"],
        beego.ControllerComments{
            Method: "Put",
            Router: `/:id`,
            AllowHTTPMethods: []string{"put"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserBindController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserBindController"],
        beego.ControllerComments{
            Method: "Delete",
            Router: `/:id`,
            AllowHTTPMethods: []string{"delete"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserController"],
        beego.ControllerComments{
            Method: "Post",
            Router: `/`,
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserController"],
        beego.ControllerComments{
            Method: "GetAll",
            Router: `/`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserController"],
        beego.ControllerComments{
            Method: "GetOne",
            Router: `/:id`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserController"],
        beego.ControllerComments{
            Method: "Put",
            Router: `/:id`,
            AllowHTTPMethods: []string{"put"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserController"],
        beego.ControllerComments{
            Method: "Delete",
            Router: `/:id`,
            AllowHTTPMethods: []string{"delete"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserFollowRelationController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserFollowRelationController"],
        beego.ControllerComments{
            Method: "Post",
            Router: `/`,
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserFollowRelationController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserFollowRelationController"],
        beego.ControllerComments{
            Method: "GetAll",
            Router: `/`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserFollowRelationController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserFollowRelationController"],
        beego.ControllerComments{
            Method: "GetOne",
            Router: `/:id`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserFollowRelationController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserFollowRelationController"],
        beego.ControllerComments{
            Method: "Put",
            Router: `/:id`,
            AllowHTTPMethods: []string{"put"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserFollowRelationController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserFollowRelationController"],
        beego.ControllerComments{
            Method: "Delete",
            Router: `/:id`,
            AllowHTTPMethods: []string{"delete"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserOnlineStateController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserOnlineStateController"],
        beego.ControllerComments{
            Method: "Post",
            Router: `/`,
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserOnlineStateController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserOnlineStateController"],
        beego.ControllerComments{
            Method: "GetAll",
            Router: `/`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserOnlineStateController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserOnlineStateController"],
        beego.ControllerComments{
            Method: "GetOne",
            Router: `/:id`,
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserOnlineStateController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserOnlineStateController"],
        beego.ControllerComments{
            Method: "Put",
            Router: `/:id`,
            AllowHTTPMethods: []string{"put"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["An_Server/api_server/controllers:UserOnlineStateController"] = append(beego.GlobalControllerRouter["An_Server/api_server/controllers:UserOnlineStateController"],
        beego.ControllerComments{
            Method: "Delete",
            Router: `/:id`,
            AllowHTTPMethods: []string{"delete"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

}
