package models

import (
	// "encoding/json"
	"errors"
	// "io/ioutil"
	// "net/http"
	// "strconv"
	// "time"
	"fmt"
	// MySQL
	"database/sql"
	// _ "github.com/go-sql-driver/mysql"
)

func init() {
}

func GetUnfinishedTrip(token string, platform int) (ordernumber string, err error) {
	u, err := GetUserWithToken(token, platform)
	if err != nil {
		return "", err
	} else if u == nil {
		return "", errors.New("无此用户")
	}

	err = dbw.Db.QueryRow(`SELECT order_number FROM trip WHERE user_id = ? AND state = 1`, u.Id).Scan(&ordernumber)
	if err == sql.ErrNoRows {
		return "", nil
	}
	return
}

func CreateTrip(token string, platform int) (ordernumber string, err error) {
	u, err := GetUserWithToken(token, platform)
	if err != nil {
		return "", err
	} else if u == nil {
		return "", errors.New("无此用户")
	}

	stmt, err := dbw.Db.Prepare("INSERT INTO trip(order_number, user_id, state) VALUES (?, ?, 1)")
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	rs, err := stmt.Exec("789", u.Id)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	affect, _ := rs.RowsAffected()
	fmt.Println(affect)
	if affect == 0 {
		return "", errors.New("创建行程失败")
	}
	
	return "789", nil
}