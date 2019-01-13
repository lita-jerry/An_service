package models

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
)

type DbWorker struct {
	Dsn      string
	Db       *sql.DB
	UserInfo userTB
}

type userTB struct {
	Id              int
	NickName        sql.NullString
	AvatarUrl       sql.NullString
	State           sql.NullInt64
	CreatedTime     time.Time
	LastUpdatedTime time.Time
	// Age  sql.NullInt64
}

type userBindTB struct {
	Id 				int
	UserId 			int
	Platfrom		int
	OpenId 			string
	CreatedTime     time.Time
	LastUpdatedTime time.Time
}

var (
	UserList map[string]*User
	dbw DbWorker
)

func init() {
	var err error
	dbw = DbWorker{
		Dsn: "root:CKK.930807@tcp(localhost:3306)/an?parseTime=true&charset=utf8mb4",
	}
	dbw.Db, err = sql.Open("mysql", dbw.Dsn)
	if err != nil {
		panic(err)
		return
	}
	// defer dbw.Db.Close()

	// dbw.queryData()

	// UserList = make(map[string]*User)
	// u := User{"user_11111", "astaxie", "11111", Profile{"male", 20, "Singapore", "astaxie@gmail.com"}}
	// UserList["user_11111"] = &u
}

type User struct {
	Id       string
	Username string
	Password string
	Profile  Profile
}

type Profile struct {
	Gender  string
	Age     int
	Address string
	Email   string
}

func (dbw *DbWorker) queryDataPre() {
	dbw.UserInfo = userTB{}
}
func (dbw *DbWorker) queryData() {
	stmt, _ := dbw.Db.Prepare(`SELECT * From user`)
	defer stmt.Close()

	dbw.queryDataPre()

	rows, err := stmt.Query()
	defer rows.Close()
	if err != nil {
		fmt.Printf("insert data error: %v\n", err)
		return
	}
	for rows.Next() {
		err = rows.Scan(&dbw.UserInfo.Id, 
						&dbw.UserInfo.NickName, 
						&dbw.UserInfo.AvatarUrl,
						&dbw.UserInfo.State,
						&dbw.UserInfo.CreatedTime,
						&dbw.UserInfo.LastUpdatedTime)
		if err != nil {
			fmt.Printf(err.Error())
			continue
		}
		if !dbw.UserInfo.NickName.Valid {
			dbw.UserInfo.NickName.String = ""
		}
		if !dbw.UserInfo.AvatarUrl.Valid {
			dbw.UserInfo.AvatarUrl.String = ""
		}
		if !dbw.UserInfo.State.Valid {
			dbw.UserInfo.State.Int64 = 0
		}
		fmt.Println("get data, id: ", dbw.UserInfo.Id, 
					" NickName: ", dbw.UserInfo.NickName.String, 
					" AvatarUrl: ", dbw.UserInfo.AvatarUrl.String, 
					" State: ", int(dbw.UserInfo.State.Int64),
					" CreatedTime: ", dbw.UserInfo.CreatedTime)
	}

	err = rows.Err()
	if err != nil {
		fmt.Printf(err.Error())
	}
}

func Login(nickname, avatarurl, code string) (token string, err error) {
	openid, session_key, err := weappJScode2Session(code)
	if err != nil {
		// return "", err
	}
	openid = "oljeP4vGE3tfAqqL2bZA8PM3zDOI1"

	var userid int64 = 0
	// 查询该openid是否已经绑定
	err = dbw.Db.QueryRow(`SELECT user_id FROM user_bind WHERE platform = ? AND open_id = ?`, 1, openid).Scan(&userid)
	if err != nil && err != sql.ErrNoRows {
		fmt.Printf("SELECT user_id FROM user_bind WHERE platform = %s AND open_id = %s\nErr: %v\n", 1, openid, err)
		return "", err
	}

	// 如果没有绑定, 注册用户并绑定平台
	if userid == 0 {
		Tx, err := dbw.Db.Begin()
		if err != nil {
			fmt.Println(err)
			return "", err
		}
		// 创建用户
		stmt, err := dbw.Db.Prepare("INSERT INTO user(nick_name, avatar_url, state) VALUES (?, ?, 1)")
		if err != nil {
			fmt.Println(err)
			return "", err
		}
		rs, err := stmt.Exec(nickname, avatarurl)
		if err != nil {
			fmt.Printf("INSERT INTO user(nick_name, avatar_url, state) VALUES (%s, %s, 1)\nErr: %v\n", nickname, avatarurl, err)
			Tx.Rollback()
			return "", err
		}
		userid, err = rs.LastInsertId()
		// 绑定平台
		stmt, err = dbw.Db.Prepare("INSERT INTO user_bind(user_id, platform, open_id) VALUES (?, 1, ?)")
		if err != nil {
			fmt.Println(err)
			return "", err
		}
		rs, err = stmt.Exec(userid, openid)
		if err != nil {
			fmt.Printf("INSERT INTO user_bind(user_id, platform, open_id) VALUES (%s, 1, %s)\nErr: %v\n", userid, openid, err)
			Tx.Rollback()
			return "", err
		}
		Tx.Commit()
	}

	// 生成token并更新
	// var token = ""

	return openid + "  " + session_key + "  token value", nil
}

func weappJScode2Session(code string) (openid, session_key string, err error) {
	resp, err := http.Get("https://api.weixin.qq.com/sns/jscode2session" +
		"?appid=" + "wx22a93273d6c1ea5f" +
		"&secret=" + "" +
		"&js_code=" + code +
		"&grant_type=authorization_code")
	if err != nil {
		return "", "", err
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", "", err
	}

	var dat map[string]interface{}
	if err := json.Unmarshal([]byte(body), &dat); err == nil {
		if dat["errcode"] != nil {
			return "", "", errors.New(dat["errmsg"].(string))
		} else {
			return dat["openid"].(string), dat["session_key"].(string), nil
		}
	} else {
		return "", "", err
	}
}

func GetUserWithOpenId(openid string, platform int) (userid int, nickname, avatarurl string, state int, err error) {

	err = dbw.Db.QueryRow(`SELECT user_id From user_bind where platform = ? AND open_id = ?`, platform, openid).Scan(&userid)
	if err != nil && err != sql.ErrNoRows {
		fmt.Printf("SELECT user_id From user_bind where platform = %s AND open_id = %s\nErr: %v", platform, openid, err)
		return 0, "", "", 0, err
	}
	return userid, nickname, avatarurl, state, nil
}

func AddUser(u User) string {
	u.Id = "user_" + strconv.FormatInt(time.Now().UnixNano(), 10)
	UserList[u.Id] = &u
	return u.Id
}

func GetUser(uid string) (u *User, err error) {
	if u, ok := UserList[uid]; ok {
		return u, nil
	}
	return nil, errors.New("User not exists")
}

func GetAllUsers() map[string]*User {
	return UserList
}

func UpdateUser(uid string, uu *User) (a *User, err error) {
	if u, ok := UserList[uid]; ok {
		if uu.Username != "" {
			u.Username = uu.Username
		}
		if uu.Password != "" {
			u.Password = uu.Password
		}
		if uu.Profile.Age != 0 {
			u.Profile.Age = uu.Profile.Age
		}
		if uu.Profile.Address != "" {
			u.Profile.Address = uu.Profile.Address
		}
		if uu.Profile.Gender != "" {
			u.Profile.Gender = uu.Profile.Gender
		}
		if uu.Profile.Email != "" {
			u.Profile.Email = uu.Profile.Email
		}
		return u, nil
	}
	return nil, errors.New("User Not Exist")
}

// func Login(username, password string) bool {
// 	for _, u := range UserList {
// 		if u.Username == username && u.Password == password {
// 			return true
// 		}
// 	}
// 	return false
// }

func DeleteUser(uid string) {
	delete(UserList, uid)
}
