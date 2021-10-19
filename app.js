var http = require('http');
var dt = require('./mydatemodule');
var db = require('./db_config');
var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/mydb";
var url = "mongodb+srv://root:<passowod>@clusterstream.spqx9.mongodb.net/";

// MongoClient.connect(url, function (err, db) {
//   if (err) throw err;
//   var dbo = db.db("MyStreamDB");
//   var myobj = [
//     { name: 'test' }
//   ];
//   dbo.collection("customers").insertMany(myobj, function (err, res) {
//     if (err) throw err;
//     console.log("Number of documents inserted: " + res.insertedCount);
//     db.close();
//   });
// });
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("The date and time are currently: " + dt.myDateTime() + "\n");
  res.end('Hello World!');
}).listen(8080);
console.log("ersd");