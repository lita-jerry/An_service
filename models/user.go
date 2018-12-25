package models

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"
)

var (
	UserList map[string]*User
)

func init() {
	UserList = make(map[string]*User)
	u := User{"user_11111", "astaxie", "11111", Profile{"male", 20, "Singapore", "astaxie@gmail.com"}}
	UserList["user_11111"] = &u
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

func Login(nickname, avatarurl, code string) (token string, err error) {
	openid, session_key, err := weappJScode2Session(code)

	if err != nil {
		return "", err
	}

	return openid + session_key + "token value", nil
}

func weappJScode2Session(code string) (openid, session_key string, err error) {
	resp, err := http.Get("https://api.weixin.qq.com/sns/jscode2session" +
		"?appid=" + "wx22a93273d6c1ea5f" +
		"&secret=" + "d2a2bbfd031dc0f64ccc9ff9163189d4" +
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
		fmt.Println(dat)
		if dat["errcode"] != nil {
			return "", "", errors.New(dat["errmsg"].(string))
		} else {
			// here
			return "dat[\"errcode\"]", dat["errmsg"].(string), nil
		}
	} else {
		return "", "", err
	}

	// return string(body), string(body), nil
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
