//Database credentials

var DB_USERNAME = "root"

var DB_PASSWORD = "301191"

var DB_NAME = "mydb"

var DB_HOST = "localhost"

// Database configuration object
var config = {
	"dbuser": DB_USERNAME,
	"dbpassword": DB_PASSWORD,
	"dbname": DB_NAME,
	"dbhost": DB_HOST,
}

//root subpath for endpoints
var ROOT = "/api"

config.root = ROOT

//Export now
module.exports = config
