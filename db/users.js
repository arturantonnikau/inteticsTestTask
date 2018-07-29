var mysql = require('mysql')

var config = require("../config/mysql-config.js")

var connection = mysql.createConnection({
		database: config.dbname,
		user: config.dbuser,
		password: config.dbpassword,
		host: config.dbhost,
})

var records = []

exports.renderData = function() {
	var data = connection.query("SELECT * FROM operators", function(err, rows, fields){
		if(err) throw err
		var recordsStr = JSON.stringify(rows)
		records = JSON.parse(recordsStr)
		console.log(records)
	})
}

exports.decrReliability = function(userID, androidId, callbackDecrReliabilityFunc) {
	connection.query("SELECT reliability FROM androids WHERE ID="+androidId+";", function(err, rows, fields){
		if(err) throw err
		return callbackDecrReliabilityFunc(rows, androidId)
	})
}

exports.reclaimedAndroid = function(callbackReclaimFunc) {
	connection.query("SELECT ID,status FROM androids ", function(err, rows, fields){
		if(err) throw err
		return callbackReclaimFunc(rows)
	})
}
/*
exports.findById = function(id, cb) {
  process.nextTick(function() {
    var idx = id - 1
    if (records[idx]) {
      cb(null, records[idx])
    } else {
      cb(new Error('User ' + id + ' does not exist'))
    }
  })
}
*/
exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i]
      if (record.username === username) {
        return cb(null, record)
      }
    }
    return cb(null, null)
  })
}
