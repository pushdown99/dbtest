'use strict';

const mysql = require('mysql');

let connection  = null;
let database    = "";
let db_host     = "";
let db_user     = "";
let db_password = "";
let db_database = "";
let verbose     = false;

module.exports = {
  init: function(n, h, u, p, d, v) { database = n; db_host = h; db_user = u; db_password = p; db_database = d; verbose = v; },
  handle: function() { return connection; },
  locale: function(database) {
    switch(database) {
    case 'mysql':
      if(connection) this.query("set time_zone='+9:00'");
    }
  },
  connect: function(callback = null) {
    let opts = { host:db_host, user:db_user, password:db_password, database:db_database, }; 

    switch(database) {
    case 'mysql':
      let mysql     = require('mysql');
      connection = mysql.createConnection(opts);
      connection.connect(function(e) {
        if(e && verbose) console.log("MySQL Error: " + e);
        if(callback) callback(e);
      });
      this.locale();
      break;

    case 'pg':
      let pg        = require('pg');
      var conn      = 'postgres://' + opts.user + ':' + opts.password + '@' + opts.host + ':' + opts.port + '/' + opts.database;
      connection = new pg.Client(conn);
      connection.connect(function(e) {
        if(callback) callback(e);
      });
      break;

    case 'mongodb':
      let mongodb   = require('mongodb');
      var conn      = 'mongodb://' + opts.host + ':' + opts.port + '/' + opts.database;
      connection = mongodb.MongoClient;
      connection.connect(conn, { useNewUrlParser: true }, function(e, db) {
        if(callback) callback(e);
      });
      break;
    }
  },
  query: function(sql, records=null, callback=null) {
    if(connection == null) this.connect();
    switch(database) {
    case 'mysql':
      connection.query(sql, records, function(e, res, f) {
        if(callback) {
          if(e && verbose) console.log (res);
          callback(e, res);
        }
      });
      break;
    case 'pg':
      connection.query(sql, (e, res) => {
        if(callback) callback(e, res.rows);
      });
      break;
    }
  },
  close: function(callback) {
      connection.end(function(e) {
          if(callback) callback(e);
      });
  }
};
