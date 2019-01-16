package models

import (
	"time"
	// MySQL
	"database/sql"
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

type followStateTB struct {
	Id	        int
	FromUserId  int
	ToUserId    int
	BothStatus  bool
	CreatedTime time.Time
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
}