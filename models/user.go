package models

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	// "strconv"
	// "time"
	"fmt"
	// MySQL
	"database/sql"
	// _ "github.com/go-sql-driver/mysql"
	// 加密部分
	"crypto/md5"
    "encoding/hex"
    "crypto/rand"
)

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

func WXMPLogin(nickname, avatarurl, code string) (token string, err error) {
	openid, sessionkey, err := weappJScode2Session(code)
	if err != nil {
		return "", err
	}

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
							nickname, avatarurl)
		if err != nil {
			fmt.Println(err)
			Tx.Rollback()
			return "", err
		}
		userid, err = rs.LastInsertId()
		// 绑定平台
		_, err = Tx.Exec("INSERT INTO user_bind(user_id, platform, open_id) VALUES (?, 1, ?)",
						 userid, openid)
		if err != nil {
			fmt.Println(err)
			Tx.Rollback()
			return "", err
		}
		Tx.Commit()
	}

	// 生成token
	b := make([]byte, 16)
    rand.Read(b)
    hasher := md5.New()
    hasher.Write([]byte(b))
    token = hex.EncodeToString(hasher.Sum(nil))
	fmt.Printf("generate random Token: %s\n", token)
	
	// 更新token
	stmt, err := dbw.Db.Prepare("INSERT INTO user_online_state SET user_id=?, platform=?, state=?, client_token=?, session_key=?, device_id=?, device_token=? ON DUPLICATE KEY UPDATE platform=?, state=?, client_token=?, session_key=?, device_id=?, device_token=?")
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	_, err = stmt.Exec(userid, 1, 1, token, sessionkey, nil, nil, 1, 1, token, sessionkey, nil, nil)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	return token, nil
}

func weappJScode2Session(code string) (openid, session_key string, err error) {
	resp, err := http.Get("https://api.weixin.qq.com/sns/jscode2session" +
		"?appid=" + "wx22a93273d6c1ea5f" +
		"&secret=" + "6512a53d2576e1629117121825f39492" +
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

	err = dbw.Db.QueryRow(`SELECT user_id FROM user_bind WHERE platform = ? AND open_id = ?`, platform, openid).Scan(&userid)
	if err != nil && err != sql.ErrNoRows {
		fmt.Printf("SELECT user_id FROM user_bind WHERE platform = %s AND open_id = %s\nErr: %v", platform, openid, err)
		return 0, "", "", 0, err
	}
	return userid, nickname, avatarurl, state, nil
}

func GetUserWithToken(token string, platform int) (u *userTB, err error) {
	var userid int
	err = dbw.Db.QueryRow(`SELECT user_id FROM user_online_state WHERE client_token = ? AND platform = ?`, token, platform).Scan(&userid)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		} else {
			return nil, err
		}
	}

	u = &userTB{}
	
	err = dbw.Db.QueryRow(`SELECT * FROM user WHERE id = ?`, userid).Scan(&u.Id, &u.NickName, &u.AvatarUrl, &u.State, &u.CreatedTime, &u.LastUpdatedTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("Token无效")
		} else {
			fmt.Println(err)
			return nil, err
		}
	}
	return u, nil
}

// 关注相关

func AddFollow(fromUserId, toUserId int) (err error) {
	isFollow, err := GetFollowState(fromUserId, toUserId)
	if err != nil {
		fmt.Println(err)
		return
	}
	if isFollow {
		return errors.New("已经关注过了")
	}

	toUserIsFromUserFollower, err := GetFollowState(toUserId, fromUserId)

	Tx, err := dbw.Db.Begin()
	if err != nil {
		fmt.Println(err)
		return
	}

	_, err = Tx.Exec("INSERT INTO follow_state(from_user_id, to_user_id, both_status) VALUES(?,?,?)", 
					 fromUserId, toUserId, toUserIsFromUserFollower)
	if err != nil {
		fmt.Println(err)
		Tx.Rollback()
		return
	}
	// 互关
	if toUserIsFromUserFollower {
		_, err = Tx.Exec("UPDATE follow_state SET both_status=TRUE WHERE from_user_id=? AND to_user_id=?", 
						 toUserId, fromUserId)
		if err != nil {
			fmt.Println(err)
			Tx.Rollback()
			return
		}
	}
	Tx.Commit()
	return
}

func DeleteFollow(token string, platform, toUserId int) (err error) {
	return
}

func GetFollowState(fromUserId, toUserId int) (isFollow bool, err error) {
	rowId := 0
	err = dbw.Db.QueryRow(`SELECT id FROM follow_state WHERE from_user_id = ? AND to_user_id = ?`, 
						  fromUserId, toUserId).Scan(&rowId)
	if err != nil && err != sql.ErrNoRows {
		return false, err
	}
	return err != sql.ErrNoRows, nil // 没有数据的话, err一定是sql.ErrNoRows
}

// func GetAllFollower(token string, platform) (err error) {
// 	return
// }

// func GetAllFollowing(token string, platform) (err error) {
// 	return
// }

// func GetUser(uid string) (u *User, err error) {
// 	if u, ok := UserList[uid]; ok {
// 		return u, nil
// 	}
// 	return nil, errors.New("User not exists")
// }

// func GetAllUsers() map[string]*User {
// 	return UserList
// }

// func UpdateUser(uid string, uu *User) (a *User, err error) {
// 	if u, ok := UserList[uid]; ok {
// 		if uu.Username != "" {
// 			u.Username = uu.Username
// 		}
// 		if uu.Password != "" {
// 			u.Password = uu.Password
// 		}
// 		if uu.Profile.Age != 0 {
// 			u.Profile.Age = uu.Profile.Age
// 		}
// 		if uu.Profile.Address != "" {
// 			u.Profile.Address = uu.Profile.Address
// 		}
// 		if uu.Profile.Gender != "" {
// 			u.Profile.Gender = uu.Profile.Gender
// 		}
// 		if uu.Profile.Email != "" {
// 			u.Profile.Email = uu.Profile.Email
// 		}
// 		return u, nil
// 	}
// 	return nil, errors.New("User Not Exist")
// }
