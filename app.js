var express = require("express")

var fs = require("fs")

var bodyParser = require("body-parser")

var session = require("express-session")

var db = require('./db')

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy

	passport.use(new LocalStrategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err) }
      if (!user) { return cb(null, false) }
      if (user.password != password) { return cb(null, false) }
      return cb(null, user)
    })
  }))

db.users.renderData()

var mysql = require("mysql")

var config = require("./config/mysql-config.js")

var port = 8080

var connection = mysql.createConnection({
		database: config.dbname,
		user: config.dbuser,
		password: config.dbpassword,
		host: config.dbhost,
})

passport.serializeUser(function(user, done) {
  done(null, user)
});

passport.deserializeUser(function(user, done) {
  done(null, user)
});

/*
passport.serializeUser(function(user, cb) {
  cb(null, user.id)
})

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err) }
    cb(null, user)
  })
})
*/

var app = express()

app.use('/', express.static(__dirname + '/public'))

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.

app.use(require('morgan')('combined'))
app.use(require('cookie-parser')())
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }))

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize())
app.use(passport.session())

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next()
	} else {
		res.redirect('/login')
	}
}

function callbackDecrReliabilityFunc(rows, androidId) {
  console.log(androidId)
  var reliability = JSON.stringify(rows)
  reliability = JSON.parse(reliability)
  reliability  = reliability[0]["reliability"]
  if(reliability > 0){ reliability--; }

    if(reliability == 0){
        var query = "UPDATE androids SET reliability="+reliability+", status = 0 WHERE ID=" +androidId+ ";"
    }else var query = "UPDATE androids SET reliability="+reliability+" WHERE ID=" +androidId+ ";"

  console.log(query)
  connection.query(query, function(err, rows, fields){
      if(err) throw err
      console.log("UPDATE androids SET reliability")
  })
}

function callbackReclaimFunc(rows) {
  var status = JSON.stringify(rows)
  status = JSON.parse(status)
  for(var obj of status){
    if(obj["status"] == 0){
      var query = "UPDATE jobs SET android_id=NULL WHERE android_id=" +obj["ID"]+ ";"
      connection.query(query, function(err, result){
          if(err) throw err
          console.log("UPDATE jobs android_id=NULL if status=0")
      })
    }
  }

}

app.get(config.root+"/androids/", function(request, response){

/*
mysql> SELECT * FROM androids;
+----+----------+---------------+------------------------------------------------------------+-------------+--------+
| ID | name     | avatar        | skill                                                      | reliability | status |
+----+----------+---------------+------------------------------------------------------------+-------------+--------+
|  6 | Android1 | pictures1.png | ["<p>And1 teg1</p>","<p>And1 teg2</p>","<p>And1 teg3</p>"] |          10 |      1 |
|  8 | Android2 | pictures2.png | ["<p>And2 teg1</p>","<p>And2 teg2</p>","<p>And2 teg3</p>"] |          10 |      1 |
| 11 | Android3 | pictures3.png | ["<p>And3 teg3</p>","<p>And3 teg2</p>","<p>And3 teg3</p>"] |          10 |      1 |
| 12 | Android4 | pictures4.png | ["<p>And4 teg1</p>","<p>And4 teg2</p>","<p>And4 teg3</p>"] |          10 |      1 |
| 13 | Android5 | pictures5.png | ["<p>And5 teg1</p>","<p>And5 teg2</p>","<p>And5 teg3</p>"] |          10 |      1 |
+----+----------+---------------+------------------------------------------------------------+-------------+--------+
5 rows in set (0.00 sec)
*/

connection.query("SELECT * FROM androids", function(err, data){
		if(err){
			response.writeHead(500, {"Content-Type": "application/json"})
			response.end(JSON.stringify({message: "Server Error", "status": 500}))
		}
		response.writeHead(200, {"Content-Type": "application/json"})
		response.end(JSON.stringify(data))
	})
})

app.get(config.root+"/jobs/", function(request, response){

/*
mysql> SELECT * FROM jobs;
+----+------+--------------+------------------+------------+
| ID | name | description  | complexity_level | android_id |
+----+------+--------------+------------------+------------+
|  3 | job1 | description1 | 10               |       NULL |
|  4 | job2 | description2 | 11               |       NULL |
|  7 | job3 | description3 | 12               |         11 |
|  8 | job6 | description6 | 13               |         12 |
+----+------+--------------+------------------+------------+
4 rows in set (0.00 sec)
*/

connection.query("SELECT * FROM jobs", function(err, data){
		if(err){
			response.writeHead(500, {"Content-Type": "application/json"})
			response.end(JSON.stringify({message: "Server Error", "status": 500}))
		}
		response.writeHead(200, {"Content-Type": "application/json"})
		response.end(JSON.stringify(data))
	})
})

//Get a particular android(JSON)
app.get(config.root+"/androids/:userId", function(request, response){
	var  userId = request.params.userId
	console.log(typeof userId)

	connection.query("SELECT * from androids WHERE id="+userId+"", function(err, data){
		if(err){
			response.writeHead(500, {"Content-Type": "application/json"})
			response.end(JSON.stringify({message: "Server Error", "status": 500}))
		}

		var newUser = {};

		for (let user of data){
			console.log("User: ", user)
			newUser = user
			break
		}
		response.writeHead(200, {"Content-Type": "application/json"})
		response.end(JSON.stringify(newUser))
	})
})

//Get a particular job(JSON)
app.get(config.root+"/jobs/:userId", function(request, response){
	var  userId = request.params.userId
	console.log(typeof userId)

	connection.query("SELECT * from jobs WHERE id="+userId+"", function(err, data){
		if(err){
			response.writeHead(500, {"Content-Type": "application/json"})
			response.end(JSON.stringify({message: "Server Error", "status": 500}))
		}

		var newUser = {}

		for (let user of data){
			console.log("User: ", user)
			newUser = user
			break
		}
		response.writeHead(200, {"Content-Type": "application/json"})
		response.end(JSON.stringify(newUser))
	})
})

app.get("/androids/update/:userId", function(request, response){
	fs.readFile("./update_android.html", function(err, data){
		response.writeHead(200, {"Content-Type": "text/html"})
		response.end(data)
	})
})

//Rendering jobs page for updating user details
app.get("/jobs/update/:userId", function(request, response){
	fs.readFile("./update_job.html", function(err, data){
		response.writeHead(200, {"Content-Type": "text/html"})
		response.end(data)
	})
})

app.get("/androids/read/:userId", function(request, response){
	fs.readFile("./read_androids.html", function(err, data){
		response.writeHead(200, {"Content-Type": "text/html"})
		response.end(data)
	})
})

app.get("/jobs/read/:userId", function(request, response){
	fs.readFile("./read_jobs.html", function(err, data){
		response.writeHead(200, {"Content-Type": "text/html"})
		response.end(data)
	})
})

app.get("/androids/create/", function(request, response){
	fs.readFile("./post_android.html", function(err, data){
		response.writeHead(200, {"Content-Type": "text/html"})
		response.end(data)
	})
})

app.get("/about/", function(request, response){
	fs.readFile("./about.html", function(err, data){
		response.writeHead(200, {"Content-Type": "text/html"})
		response.end(data)
	})
})

app.get("/job/create/", function(request, response){
	fs.readFile("./post_job.html", function(err, data){
		response.writeHead(200, {"Content-Type": "text/html"})
		response.end(data)
	})
})

app.get("/", ensureAuthenticated,  function(request, response){
  db.users.reclaimedAndroid(callbackReclaimFunc)
	fs.readFile("./home.html", function(err, data){
		response.writeHead(200, {"Content-Type": "text/html"})
		response.end(data)
	})
})

//Rendering page to create new user
app.get("/register", function(request, response){
	fs.readFile("./post_user.html", function(err, data){
		response.writeHead(200, {"Content-Type": "text/html"})
		response.end(data)
	})
})

//Rendering page for user login
app.get("/login", function(request, response){
	fs.readFile("./login.html", function(err, data){
		response.writeHead(200, {"Content-Type": "text/html"})
		response.end(data)
	})
})

//Rendering page for Androids page
app.get("/androids", ensureAuthenticated,  function(request, response){
	fs.readFile("./androids.html", function(err, data){
		response.writeHead(200, {"Content-Type": "text/html"})
		response.end(data)
	})
})

//Rendering page for Jobs page
app.get("/jobs", ensureAuthenticated, function(request, response){
	fs.readFile("./jobs.html", function(err, data){
		response.writeHead(200, {"Content-Type": "text/html"})
		response.end(data)
	})
})

app.get("/androids/assign/:userId", function(request, response){
	fs.readFile("./assign_job.html", function(err, data){
		response.writeHead(200, {"Content-Type": "text/html"})
		response.end(data)
	})
})

app.use(bodyParser.json())

//Updating androids (JSON)
app.put(config.root+"/androids/:userId", function(request, response){
	var  userId = request.params.userId

	if( !/^\d+$/.test(userId)){
		response.json({"status": 400, "message": "userId should be an integer"})
		return
	}

	var data = request.body
	var totalKeys = Object.keys(data).length
	console.log("GOT", data)

	if(data){
		let query =  "UPDATE androids SET "
		let i = 1
		for(let key in data){
			if(i === totalKeys){ //If it is last key
				if(typeof key == 'string'){
					query += (key + "='"+data[key].trim()+"'" )
				} else {//number
					query += (key + "="+data[key] )
				}
			} else {//If it is not the last key
				if(typeof key == 'string'){
					query += (key + "='"+data[key].trim()+"'," )
				} else {//number
					query += (key + "="+data[key]+"," )
				}
			}
			i += 1
		}
		query += " where id="+userId
		console.log("QUERY: ", query)

		connection.query(query, function(err, result){
			if(err){
				response.writeHead(500, {"Content-Type": "application/json"})
				response.end(JSON.stringify({message: "Server Error", "status": 500}))
				return
			}
			console.log("Query successfully executed")
			response.status(200)
			response.json({"status": 200, "message": "Details successfully updated"})
		})
	} else {
		response.status(400)
		response.json({"status": 400, "message": "Could not found data"})
	}
})

//Updating jobs (JSON)
app.put(config.root+"/jobs/:userId", function(request, response){
	var  userId = request.params.userId

	if( !/^\d+$/.test(userId)){
		response.json({"status": 400, "message": "userId should be an integer"})
		return
	}

	var data = request.body
	var totalKeys = Object.keys(data).length
	console.log("GOT", data)

	if(data){
		//Query preparation
		let query =  "UPDATE jobs SET "
		let i = 1
		for(let key in data){
			if(i === totalKeys){ //If it is last key
				if(typeof key == 'string'){
					query += (key + "='"+data[key].trim()+"'" )
				} else {//number
					query += (key + "="+data[key] )
				}
			} else {//If it is not the last key
				if(typeof key == 'string'){
					query += (key + "='"+data[key].trim()+"'," )
				} else {//number
					query += (key + "="+data[key]+"," )
				}
			}
			i += 1
		}
		query += " where id="+userId
		console.log("QUERY: ", query)

		connection.query(query, function(err, result){
			if(err){
				response.writeHead(500, {"Content-Type": "application/json"})
				response.end(JSON.stringify({message: "Server Error", "status": 500}))
				return
			}
			console.log("Query successfully executed")
			response.status(200)
			response.json({"status": 200, "message": "Details successfully updated"})
		})
	} else {
		response.status(400)
		response.json({"status": 400, "message": "Could not found data"})
	}
})


app.delete(config.root + "/androids/:userId", function(request, response){
	var  userId = request.params.userId

	if( !/^\d+$/.test(userId)){
		response.status(400)
		response.json({"status": 400, "message": "userId should be an integer"})
		return
	}

	var query = "DELETE FROM androids WHERE id="+userId+";"
	console.log("Deleting " + userId)
	console.log(query)

	connection.query(query, function(err, result){
		if(err){
			response.status(500);
			console.log(500);
			response.json({"status": 500, "message": "Server Error"});
			return
		} else {
			response.status(200);
			console.log(result);
			response.json({"status": 200, "message": "Android successfully Deleted"});
		}
	})
})


app.delete(config.root + "/jobs/:userId", function(request, response){
	var  userId = request.params.userId

	if( !/^\d+$/.test(userId)){
		response.status(400)
		response.json({"status": 400, "message": "userId should be an integer"})
		return
	}

	var query = "DELETE FROM jobs WHERE id="+userId+";"
	console.log("Deleting " + userId)
	console.log(query)

	connection.query(query, function(err, result){
		if(err){
			response.status(500);
			console.log(500);
			response.json({"status": 500, "message": "Server Error"});
			return
		} else {
			response.status(200);
			console.log(result);
			response.json({"status": 200, "message": "Job successfully Deleted"});
		}
	})
})


app.put(config.root + "/jobs/assign/:userId/:androidId", function(request, response){
	var  userId = request.params.userId
	var  androidId= request.params.androidId

	if( !/^\d+$/.test(userId)){
		response.status(400)
		response.json({"status": 400, "message": "userId should be an integer"})
		return
	}

	if( !/^\d+$/.test(androidId)){
		response.status(400)
		response.json({"status": 400, "message": "userId should be an integer"})
		return
	}

  db.users.decrReliability(userId, androidId, callbackDecrReliabilityFunc)

	var query = "UPDATE jobs SET android_id=" + androidId + " WHERE id="+userId+";"
	console.log("Assigned " + userId)
	console.log(query)

	connection.query(query, function(err, result){
		if(err){
			response.status(500)
			console.log(500)
			response.json({"status": 500, "message": "Server Error"})
			return
		} else {
			response.status(200)
			console.log(result)
			response.json({"status": 200, "message": "User successfully activated"})
		}
	})
})

//Posting users(JSON)
app.post(config.root+"/users/create", function(request, response){
  /*
  mysql> SELECT * FROM operators;
  +----+----------+----------+
  | ID | username | password |
  +----+----------+----------+
  |  1 | artur    | 301191   |
  |  2 | nastya   | 250192   |
  |  3 | iryna    | 120372   |
  +----+----------+----------+
  3 rows in set (0.00 sec)
  */
	var data = request.body
	var totalKeys = Object.keys(data).length
	console.log("GOT", data)

	if(data){

		let query = "SELECT username FROM operators WHERE username = '"+data.username+ "';"
    console.log(query)
		connection.query(query, function(err, result){
			if(err) {
				response.writeHead(500, {"Content-Type": "application/json"})
				response.end(JSON.stringify({message: "Server Error", "status": 500}))
				return
			}

			if(result.length != 0){
				console.log("Operator is already registered")
				response.status(404)
				response.json({"status": 404, "message": "Operator is already registered"})
				return
			}
			query =  "INSERT INTO operators("
			let columns = ""
			let values = "VALUES("

			let i = 1
			for(let key in data){
				if(i === totalKeys){ //If it is last key
					if(typeof key == 'string'){
						columns += key
						values += ("'"+data[key].trim()+"'")
					} else {//number
						values += data[key].trim()
					}
				} else {//If it is not the last key...even it is not required
					if(typeof key == 'string'){
						columns += key+","
						values += ("'"+data[key].trim()+"',")
					} else {//number
						query += data[key]+","
					}
				}
				i += 1
			}
			query += columns + ") " + values + ");"
			console.log("QUERY: ", query)

			//Updating data into users table
			connection.query(query, function(err, result){
				if(err){
					response.writeHead(500, {"Content-Type": "application/json"})
					response.end(JSON.stringify({message: "Server Error", "status": 500}))
					return
				}
				console.log("Query successfully executed")
				response.status(200)
				response.json({"status": 200, "message": "Account successfully created"})
        db.users.renderData();
			})
		})

	} else {
		response.status(400)
		response.json({"status": 400, "message": "Could not found data"})
	}
})

//Posting android(JSON)
app.post(config.root+"/android/create", function(request, response){
	var data = request.body
	var totalKeys = Object.keys(data).length
	console.log("GOT", data)

	if(data){

		let query = "SELECT name from `androids` WHERE name = '" + data["name"] + "'"
		connection.query(query, function(err, result){
			if(err) {
				response.writeHead(500, {"Content-Type": "application/json"})
				response.end(JSON.stringify({message: "Server Error", "status": 500}))
				return
			}

			if(result.length != 0){
				console.log("Operator is already registered")
				response.status(404)
				response.json({"status": 404, "message": "Operator is already registered"})
				return
			}
			query =  "INSERT INTO androids("
			let columns = ""
			let values = "VALUES("

			let i = 1
			for(let key in data){
				if(i === totalKeys){ //If it is last key
					if(typeof key == 'string'){
						columns += key
						values += ("'"+data[key].trim()+"'")
					} else {//number
						values += data[key].trim()
					}
				} else {//If it is not the last key...even it is not required
					if(typeof key == 'string'){
						columns += key+","
						values += ("'"+data[key].trim()+"',")
					} else {//number
						query += data[key]+","
					}
				}
				i += 1
			}
			query += columns + ") " + values + ")"
			console.log("QUERY: ", query)

			connection.query(query, function(err, result){
				if(err){
					response.writeHead(500, {"Content-Type": "application/json"})
					response.end(JSON.stringify({message: "Server Error", "status": 500}))
					return
				}
				console.log("Query successfully executed")
				response.status(200)
				response.json({"status": 200, "message": "Account successfully created"})
        db.users.renderData();
			})
		})

	} else {
		response.status(400)
		response.json({"status": 400, "message": "Could not found data"})
	}
})


app.post(config.root+"/job/create", function(request, response){
	var data = request.body
	var totalKeys = Object.keys(data).length
	console.log("GOT", data)

	if(data){

		let query = "SELECT name from `jobs` WHERE name = '" + data["name"] + "'"
		connection.query(query, function(err, result){
			if(err) {
				response.writeHead(500, {"Content-Type": "application/json"})
				response.end(JSON.stringify({message: "Server Error", "status": 500}))
				return
			}

			if(result.length != 0){
				console.log("Operator is already registered")
				response.status(404)
				response.json({"status": 404, "message": "Operator is already registered"})
				return
			}
			query =  "INSERT INTO jobs ("
			let columns = ""
			let values = "VALUES("

			let i = 1
			for(let key in data){
				if(i === totalKeys){ //If it is last key
					if(typeof key == 'string'){
						columns += key
						values += ("'"+data[key].trim()+"'")
					} else {//number
						values += data[key].trim()
					}
				} else {//If it is not the last key...even it is not required
					if(typeof key == 'string'){
						columns += key+","
						values += ("'"+data[key].trim()+"',")
					} else {//number
						query += data[key]+","
					}
				}
				i += 1
			}
			query += columns + ") " + values + ")"
			console.log("QUERY: ", query)

			connection.query(query, function(err, result){
				if(err){
					response.writeHead(500, {"Content-Type": "application/json"})
					response.end(JSON.stringify({message: "Server Error", "status": 500}))
					return
				}
				console.log("Query successfully executed")
				response.status(200)
				response.json({"status": 200, "message": "Account successfully created"})
			})
		})

	} else {
		response.status(400)
		response.json({"status": 400, "message": "Could not found data"})
	}
})

//Login

app.post(config.root+"/login", passport.authenticate('local'), function(request, response){
	var data = request.body
	console.log("GOT", data)

	if(data){
		let query =  "SELECT * FROM operators WHERE username='"+data.username+ "' AND password='"+data.password+"';"

		connection.query(query, function(err, result){
			if(err){
				console.log(query);
				response.writeHead(500, {"Content-Type": "application/json"})
				response.end(JSON.stringify({message: "Server Error", "status": 500}))
				return
			}

			console.log(result)
			console.log("Query successfully executed")

			if(result.length == 0){
				console.log("Could not found the user")
				response.status(200)
				response.json({"status": 404, "message": "Please check your name/password"})
			} else {
				console.log("User found")
				response.status(200)
				response.json({"status": 200, "message": "Successfully logged in"})
			}
		})
	} else {
		response.status(400)
		response.json({"status": 400, "message": "Could not found data"})
	}
})

app.get('/logout',
  function(req, res){
    req.logout()
    res.redirect('/')
  })


//Starting Server
var server = app.listen(port, function(){
	console.log("Server is running " + port)
})
