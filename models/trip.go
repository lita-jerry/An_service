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

func StopTrip(userid int, ordernumber string) (err error) {
	rs, err := dbw.Db.Exec("UPDATE trip SET state=2 WHERE order_number=? AND user_id=? AND state!= 2", ordernumber, userid)
	if err != nil {
		fmt.Println(err)
		return
	}
	affect, _ := rs.RowsAffected()
	
	if affect == 0 {
		return errors.New("结束行程失败")
	}
	return nil
}

// 创建行程订单号
func ordernumberGenerator() string {
	t := time.Now()

	b := make([]byte, 4)
	rand.Read(b)
	
	return fmt.Sprintf("%s%x", t.Format("20060102150405"), b)
}

func GetTripInfo(ordernumber string) (trip *tripTB, err error) {
	trip = &tripTB{}
	err = dbw.Db.QueryRow(`SELECT * FROM trip WHERE order_number=?`, ordernumber).Scan(&trip.Id, &trip.OrderNumber, &trip.UserId, &trip.State, &trip.CreatedTime, &trip.LastUpdatedTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("无数据")
		} else {
			return nil, err
		}
	}
	return
}

func GetTripLastUpdatedLocation(ordernumber string) (location *tripPolylineTB, err error) {
	location = &tripPolylineTB{}
	err = dbw.Db.QueryRow(`SELECT * FROM trip_polyline WHERE order_number=? ORDER BY created_time DESC LIMIT 1`, ordernumber).Scan(&location.Id, &location.OrderNumber, &location.Longitude, &location.Latitude, &location.Remark, &location.CreatedTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("无数据")
		} else {
			return nil, err
		}
	}
	return
}

func GetTripPolyline(ordernumber string, pageNo, pageSize int) (polyline []tripPolylineTB, err error) {
	stmt, _ := dbw.Db.Prepare(`SELECT * From trip_polyline WHERE order_number=? LIMIT ?,?`)
	defer stmt.Close()

	rows, err := stmt.Query(ordernumber, pageNo*pageSize, pageSize)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer rows.Close()
	for rows.Next() {
		location := tripPolylineTB{}
		err = rows.Scan(&location.Id, 
						&location.OrderNumber, 
						&location.Longitude, 
						&location.Latitude, 
						&location.Remark, 
						&location.CreatedTime)
		if err != nil {
			fmt.Printf(err.Error())
			continue
		}
		if !location.Remark.Valid {
			location.Remark.String = ""
		}
		polyline = append(polyline, location)
	}

	err = rows.Err()
	if err != nil {
		fmt.Printf(err.Error())
	}
	return
}

func GetFinishedTrip(userid int) (finished []tripTB, err error) {
	stmt, _ := dbw.Db.Prepare(`SELECT * From trip WHERE user_id=?`)
	defer stmt.Close()

	rows, err := stmt.Query(userid)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer rows.Close()
	for rows.Next() {
		trip := tripTB{}
		err = rows.Scan(&trip.Id, 
						&trip.OrderNumber, 
						&trip.UserId, 
						&trip.State, 
						&trip.CreatedTime, 
						&trip.LastUpdatedTime)
		if err != nil {
			fmt.Printf(err.Error())
			continue
		}
		finished = append(finished, trip)
	}

	err = rows.Err()
	if err != nil {
		fmt.Printf(err.Error())
	}
	return
}