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
