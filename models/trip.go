package models

import (
	// "encoding/json"
	// "errors"
	// "io/ioutil"
	// "net/http"
	// "strconv"
	// "time"
	"fmt"
	// MySQL
	// "database/sql"
	// _ "github.com/go-sql-driver/mysql"
)

func init() {
}

func GetUnfinishedTrip(token string, platform int) (ordernumber string, err error) {
	u, err := GetUserWithToken(token, platform)
	if err != nil {
		return "", err
	} else if u == nil {
		return "", nil
	}
	
	// Here, 根据uid获取未完成的行程

	return "order number", nil
}