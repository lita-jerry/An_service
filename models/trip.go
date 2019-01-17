package models

import (
	// "encoding/json"
	"errors"
	// "io/ioutil"
	// "net/http"
	// "strconv"
	"crypto/rand"
	"time"
	"fmt"
	// MySQL
	"database/sql"
	// _ "github.com/go-sql-driver/mysql"
)

func init() {
}

func GetUnfinishedTrip(userid int) (ordernumber string, err error) {
	err = dbw.Db.QueryRow(`SELECT order_number FROM trip WHERE user_id = ? AND state = 1`, userid).Scan(&ordernumber)
	if err == sql.ErrNoRows {
		return "", nil
	}
	return
}

func CreateTrip(userid int) (ordernumber string, err error) {
	stmt, err := dbw.Db.Prepare("INSERT INTO trip(order_number, user_id, state) VALUES (?, ?, 1)")
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	ordernumber = ordernumberGenerator()

	rs, err := stmt.Exec(ordernumber, userid)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	affect, _ := rs.RowsAffected()
	
	if affect == 0 {
		return "", errors.New("创建行程失败")
	}
	
	return ordernumber, nil
}

// 创建行程订单号
func ordernumberGenerator() string {
	t := time.Now()

	b := make([]byte, 4)
	rand.Read(b)
	
	return fmt.Sprintf("%s%x", t.Format("20060102150405"), b)
}