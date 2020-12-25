'use strict';

const dotenv  = require('dotenv').config()
let   verbose = process.env.VERBOSE || false
verbose = (verbose == 'true');

const moment  = require('moment-timezone');

let db     = require('./libs/db.js');
let pdf    = require('./libs/pdf.js');
let txt    = require('./libs/txt.js');
let fcm    = require('./libs/fcm.js');
let escp   = require('./libs/escp.js');
let misc   = require('./libs/misc.js');
let parser = require('./libs/parser.js');

let dbio   = require('./dbio.js');
let file   = require('./file.js');

let app = null;

module.exports = {
  init: function(ap) {
    app = ap;

    this.middleware();

    app.get('/xxx', function(req, res){
      res.send('hello');
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

      dbio.getUserEmail (email, function (e, r) {
        if (e) console.log(e.code); // console.log(err.fatal);
        if(r[0].passwd != passwd) {
          misc.response({ code: 204, message: "User/ Password not found!" }, req, res);
        }
        else {
          dbio.updUsers(email, fcmkey, function (e, r) {
            if (e) console.log(e.code); // console.log(err.fatal);
            if (r.affectedRows == 0) 
              misc.response({ code: 500, message: "Internal DB error!" }, req, res);
            else 
              misc.response(result, req, res);
          });
        }
      });
    });

    app.post('/sign-up/', function(req, res) {
      var email  = req.body.id;
      var pwd    = req.body.pwd;
      var records = [[ email, pwd ]];
      var result  = { code: 200, message: "OK" }

      dbio.putUsers(records, function (e, r) {
        if (e) console.log(e.code); // console.log(err.fatal);
      });
      misc.response(result, req, res);
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //
    // Receipt
    //
    app.get('/receipts', (req, res) => {
      dbio.getReceipts( function(e, r) {
        res.send(r);
      });
    });

    app.get('/receipt/email/:id', (req, res) => {
      dbio.getReceiptEmail(req.params.id, function(e, r) {
        res.send(r);
      });
    });
    app.get('/receipt/since/:email/:since', (req, res) => {
      let email = req.params.email;
      let since = req.params.since;
      dbio.getReceiptsEmailSince(email, since, function(e, r) {
        res.send(r);
      });
    });

    app.post('/receipt/:license', (req, res) => {
      let license = req.params.license;
      let data = escp.parse(req.body.Data);

      pdf.write(data, null, function(name, path_pdf) {
        txt.write(data, name, function(name, path_txt) {
          dbio.getIssueLicense(license, function (e, r) {
            console.log(r);
            dbio.getUserEmail(r[0].email, function (e, r) {
              console.log(r);
              fcm.message(process.env.KEY_FCM, r[0].fcmkey, 'https://tric.kr/' + path_pdf);
            });
          });
          parser.open(data, function(obj) {
            var records = [[ 'haeyun@gmail.com', obj.name, obj.register, obj.tel, obj.address, path_txt, path_pdf, misc.toint(obj.total), misc.toint(obj.cash), misc.toint(obj.card), obj.date ]];
            dbio.putReceipts(records, function (e, r) {
              if (e) console.log(e.code); // console.log(err.fatal);
            });
          });
        });
      });
      var result = { code: 200, message: "OK", }
      res.send(result);
    });

    app.get('/pdf/:f', (req, res) => {
      file.downloadPdf (req.params.f, req, res);
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //
    // QRcode & Issue
    //
    app.get('/qrcode/:email', function(req, res){
      var email   = req.params.email;
      let gen     = misc.generate();
      var result  = { code: 200, message: "OK", id: email, qrcode: gen, }
      var records = [[email, gen]];

      dbio.delQRcodeEmail (email);
      dbio.delIssueEmail  (email);
      dbio.putQRcodes(records, function (e, r) {
        if (e) console.log(e.code);
      });
      misc.response(result, req, res);
    });

    app.get('/issue/:license/:qrcode', function(req, res){
      var license = req.params.license;
      var qrcode  = req.params.qrcode;
      var result  = { code: 200, message: "OK" }

      console.log(qrcode);
      dbio.getQRcodeQRcode(qrcode, function (e, r) {
        console.log(r);
        if (e && verbose) console.log(r);
        var records = [[r[0].email, license]];
        //dbio.delQRcodeQRcode(qrcode);
        dbio.delIssueLicense(license);
        dbio.putIssues(records);
      });
      misc.response(result, req, res);
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
    app.get('/qrscan/:license', function(req, res){
      var license = req.params.license;
      res.render('qrscan', {license: license});
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
