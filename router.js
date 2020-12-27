'use strict';

const dotenv  = require('dotenv').config()
let   verbose = process.env.VERBOSE || false
verbose = (verbose == 'true');

const moment = require('moment-timezone');
const upload = require('express-fileupload');

let popup  = require('popups');

let db     = require('./libs/db.js');
let pdf    = require('./libs/pdf.js');
let txt    = require('./libs/txt.js');
let fcm    = require('./libs/fcm.js');
let escp   = require('./libs/escp.js');
let misc   = require('./libs/misc.js');
let parser = require('./libs/parser.js');

let ws     = require('./ws.js');
let dbio   = require('./dbio.js');
let file   = require('./file.js');

let app = null;

module.exports = {
  init: function(ap) {
    app = ap;

    app.use(upload());
    this.middleware();

    ws.init();

    ///////////////////////////////////////////////////////////////
    //
    // LOOPBACK
    //
    app.get('/loopback', function(req, res){
      res.send('loopback');
    });

    ///////////////////////////////////////////////////////////////
    //
    // ADMIN
    //
    app.get('/admin/login', function(req, res) {
      res.render('login');
    });
    app.get('/admin/signup', function(req, res) {
      res.render('signup');
    });

    ///////////////////////////////////////////////////////////////
    //
    // AGENT
    //
    app.get('/agent/setting/:mac', function(req, res) {
      let mac  = req.params.mac;
      res.send(mac);
    });
    app.get('/popup', function(req, res) {
      res.send("hello");
    });

    ///////////////////////////////////////////////////////////////
    //
    // UPLOAD
    //
    app.get('/upload', function(req, res) {
      res.render('upload');
    });
    app.post('/upload', function(req, res) {
      let sampleFile;
      let uploadPath;

      if (!req.files || Object.keys(req.files).length === 0) {
        res.status(400).send('No files were uploaded.');
        return;
      }

      console.log('req.files >>>', req.files); // eslint-disable-line

      sampleFile = req.files.sampleFile;

      uploadPath = __dirname + '/uploads/' + sampleFile.name;

      sampleFile.mv(uploadPath, function(err) {
        if (err) {
          return res.status(500).send(err);
        }

        res.send('File uploaded to ' + uploadPath);
      });
    });

    ///////////////////////////////////////////////////////////////
    //
    // SIGN-IN (LOG-IN), SIGN-UP
    //
    app.post('/sign-in/', function(req, res) {
      var email  = req.body.id;
      var passwd = req.body.pwd;
      var fcmkey = req.body.key;
      var result = { code: 200, message: "OK" }

      if(email == undefined || passwd == undefined || fcmkey == undefined) {
        return misc.response({ code: 400, message: "Bad Request!" }, req, res);
      }

      dbio.getUserEmail (email, function (e, r) {
        if (e) {
          console.log(e.code);
          return misc.response({ code: 500, message: "Internal DB error!" }, req, res);
        }
        console.log(r);
        if(r.length < 1 || r[0].passwd != passwd) {
          misc.response({ code: 204, message: "User/ Password not found!" }, req, res);
        }
        else {
          dbio.updUser(email, fcmkey, function (e, r) {
            if (e || r.affectedRows == 0) {
              console.log(e.code);
              return misc.response({ code: 500, message: "Internal DB error!" }, req, res);
            }
            else 
              return misc.response(result, req, res);
          });
        }
      });
    });

    app.post('/sign-up/', function(req, res) {
      var email  = req.body.id;
      var passwd = req.body.pwd;
      var records = [[ email, passwd ]];
      var result  = { code: 200, message: "OK" }

      dbio.putUser(records, function (e, r) {
        if (e || r.length <= 1) {
          console.log(e.code); // console.log(err.fatal);
          misc.response({ code: 500, message: "Internal DB error!" }, req, res);
        }
        else 
          misc.response(result, req, res);
      });
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //
    // PASSWORD
    //
    app.post('/password/:email', function(req, res) {
      let email  = req.params.email;
      var passwd = req.body.pwd;
      var records = [[ email, passwd ]];
      var result  = { code: 200, message: "OK" }

      dbio.updUserPasswd(records, function (e, r) {
        if (e || r.affectedRows == 0) {
          if (e) console.log(e.code); // console.log(err.fatal);
          misc.response({ code: 500, message: "Internal DB error!" }, req, res);
        }
        else
          misc.response(result, req, res);
      });
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //
    // FCM
    //
    app.get('/fcm/:id', (req, res) => {
      let id = req.params.id;
      dbio.getFcmId(id, function(e, r) {
        if (e || r.length < 1) {
          if (e) console.log(e.code); // console.log(err.fatal);
          misc.response({ code: 404, message: "Not found!" }, req, res);
        }
        else {
          res.contentType("application/json")
          res.send(JSON.stringify(r));
        }
      });
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //
    // Receipt
    //
    app.get('/receipt', (req, res) => {
      dbio.getReceipt( function(e, r) {
        res.contentType("application/json")
        res.send(JSON.stringify(r));
      });
    });

    app.get('/receipt/:email', (req, res) => {
      let email = req.params.email;
      dbio.getReceiptEmail(email, function(e, r) {
        res.contentType("application/json")
        res.send(JSON.stringify(r));
      });
    });
    app.get('/receipt/:email/:from', (req, res) => {
      let email = req.params.email;
      let from  = req.params.from;
      dbio.getReceiptEmailFrom(email, from, function(e, r) {
        res.contentType("application/json")
        res.send(r);
      });
    });

    app.post('/receipt/:license', (req, res) => {
      let license = req.params.license;
      let data    = escp.parse(req.body.Data);

      pdf.write(data, null, function(name, path_pdf) {
        txt.write(data, name, function(name, path_txt) {
          dbio.getIssueLicense(license, function (e, r) {
            if(e || r.length < 1) {
              if (e) console.log(e.code);
              misc.response({ code: 500, message: "Internal DB error!" }, req, res);
            }
            else {
              let email = r[0].email;
              dbio.getUserEmail(email, function (e, r) {
                // fcm.message(process.env.KEY_FCM, r[0].fcmkey, process.env.SERVER + '/' + path_pdf);
                let fcmkey = r[0].fcmkey;

                parser.open(data, function(obj) {
                  var records = [[ email, obj.name, obj.register, obj.tel, obj.address,  process.env.SERVER + '/' + path_txt,  process.env.SERVER + '/' + path_pdf, misc.toint(obj.total), misc.toint(obj.cash), misc.toint(obj.card), obj.date ]];
  
                  dbio.putReceipt(records, function (e, r) {
                    if (e || r.length < 1) {
                      if (e) console.log(e.code); // console.log(err.fatal);
                      else misc.response({ code: 501, message: "Internal DB error!" }, req, res);
                    }
                    else {
                      var records = [[ email, obj.name, misc.toint(obj.total), obj.date, process.env.SERVER + '/' + path_pdf, process.env.SERVER + '/' + path_txt, '' ]];
                      dbio.putFcm (records, function(e, r) {
                        if (e || r.length < 1) {
                          if (e) console.log(e.code);
                          misc.response({ code: 502, message: "Internal DB error!" }, req, res);
                        }
                        else {
                          fcm.message(process.env.KEY_FCM, fcmkey, process.env.SERVER + '/fcm/' + r.insertId);
                          misc.response({ code: 200, message: "OK" }, req, res);
                        }
                      });
                    }
                  });
                });
              });
            }
          });
        });
      });
    });

    app.get('/pdf/:f', (req, res) => {
      file.downloadPdf (req.params.f, req, res);
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //
    // QRcode & Issue
    //
    app.get('/qrcode', function(req, res){
      dbio.getQRcode(function (e, r) {
        res.send(r);
      });
    });
    app.get('/qrcode/:email', function(req, res){
      var email   = req.params.email;
      let gen     = misc.generateQRcode();
      var result  = { code: 200, message: "OK", id: email, qrcode: gen, }
      var records = [[email, gen]];

      dbio.delQRcodeEmail (email);
      dbio.delIssueEmail  (email);
      dbio.putQRcode(records, function (e, r) {
        if (e) {
          console.log(e.code);
          misc.response({ code: 500, message: "Internal DB error!" }, req, res);
        }
        else
          misc.response(result, req, res);

      });
    });

    app.get('/issue', function(req, res){
      var result  = { code: 200, message: "OK" }
      dbio.getIssue(function (e, r) {
        if (e) {
          console.log(e.code);
          misc.response({ code: 500, message: "Internal DB error!" }, req, res);
        }
        else 
          misc.response(result, req, res);
      });
    });
    app.get('/issue/:license/:qrcode', function(req, res){
      var license = req.params.license;
      var qrcode  = req.params.qrcode;
      var result  = { code: 200, message: "OK" }

      ws.send(qrcode);

      dbio.getQRcodeQRcode(qrcode, function (e, r) {
        if(e || r.length < 1) {
          if(e) console.log(e.code);
          misc.response({ code: 404, message: "Not found!" }, req, res);
        }
        else {
          var records = [[r[0].email, license]];
          //dbio.delQRcodeQRcode(qrcode);
          dbio.delIssueLicense(license);
          dbio.putIssue(records, function(e, r) {
            if(e) {
              console.log(e.code);
              misc.response({ code: 500, message: "Internal DB error!" }, req, res);
            }
            else 
              misc.response(result, req, res);
          });
        }
      });
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //
    // License 
    //
    app.get('/license/:mac', function(req, res){
      var mac   = req.params.mac;
      let gen     = misc.generate();
      var result  = { code: 200, message: "OK", id: mac, license: gen, }
      var records = [[mac, gen]];

      dbio.delLicenseMac (mac);
      dbio.putLicenses(records, function (e, r) {
        if (e) console.log(e.code);
      });
      misc.response(result, req, res);
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //
    // QR scanner 
    //
    app.get('/qrscan', function(req, res){
      var license = 1234
      res.render('qrscan', {license: license});
    });

    app.get('/qrscan/:license', function(req, res){
      var license = req.params.license;
      res.render('qrscan', {license: license});
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //
    // QR generator 
    //
    app.get('/qrgen/:text', function(req, res){
      var text = req.params.text;
      misc.qrcode(text, function(e, d) {
        //file.downloadPng (d);
        res.send ('<img src="' + d + '"/>');
      });
    });
  },

  ////////////////////////////////////////////////////////////////////////////////////////
  //
  // middleware
  //
  middleware: function() {
    app.use(function (req, res, next) {
      req.timestamp  = moment().unix();
      req.receivedAt = moment().tz('Asia/Seoul').format('YYYY-MM-DD hh:mm:ss');
      let status = res.statusCode;
      switch(req.method) {
      case "GET":
        console.log(req.receivedAt, req.protocol.toUpperCase(), req.method, req.url, req.params);
        break;
      case "POST":
        console.log(req.receivedAt, req.protocol.toUpperCase(), req.method, req.url, req.body);
        break;
      }
      var oldWrite = res.write, oldEnd = res.end;
      var chunks = [];
      res.write = function (chunk) {
        chunks.push(chunk);
        return oldWrite.apply(res, arguments);
      };
      res.end = function (chunk) {
        if(typeof chunk == 'string') {
          chunk = Buffer.from(chunk, 'utf-8');
        }
        if (chunk) chunks.push(chunk);
        let body = Buffer.concat(chunks).toString('utf8');
        //if(this.get('Content-Type') == 'application/json; charset=utf-8' || this.get('Content-Type') == 'text/html; charset=utf-8') {
        if(this.get('Content-Type') == 'application/json; charset=utf-8') {
          console.log(req.receivedAt, req.protocol.toUpperCase(), status, body);
        }
        oldEnd.apply(res, arguments);
      };
      next();
    });
  },
}
