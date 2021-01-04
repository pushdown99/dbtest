'use strict';

const dotenv  = require('dotenv').config()
let   verbose = process.env.VERBOSE || false
verbose = (verbose == 'true');

const moment = require('moment-timezone');
const upload = require('express-fileupload');

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

    //setInterval(cbDelQRcodeExpire, 1000);

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
    app.post('/using/coupon', function(req, res){
      let cpcode  = req.body.cpcode;
      var ret = dbio.getCouponCode ([cpcode]);
      if(ret.ldength < 1) {
        res.send(cpcode + ' is not found!');
      }
      else {
        var used = ret[0].used;
        if(used) {
          res.send(cpcode + ' is already used!');
        }
        else {
          ret = dbio.updCouponCodeUsed ([cpcode]);
          res.send(cpcode);
        }
      }
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

      if(email == undefined || passwd == undefined || fcmkey == undefined) return misc.response({ code: 400, message: "Bad Request!" }, req, res);

      var ret = dbio.getUserEmailPass ([email, passwd]);
      console.log (ret);
      if(ret.length < 1) {
        misc.response({ code: 400, message: "Bad Request!" }, req, res);
      }
      else {
        var ret = dbio.updUser([fcmkey, email]);
        misc.response({ code: 200, message: "OK" }, req, res);
      }
    });

    app.post('/sign-up/', function(req, res) {
      var email  = req.body.id;
      var passwd = req.body.pwd;

      if(email == undefined || passwd == undefined) return misc.response({ code: 400, message: "Bad Request!" }, req, res);
      var ret = dbio.getUserEmail (email);
      if(ret.length > 0) {
        return misc.response({ code: 400, message: "Bad Request!" }, req, res);
      }
      var ret = dbio.putUser([email, passwd]);
      if(ret.affectedRows > 0) return misc.response({ code: 200, message: "OK" }, req, res);
      else                     return misc.response({ code: 500, message: "Internal Server Error!" }, req, res);
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //
    // PASSWORD
    //
    app.post('/password/:email', function(req, res) {
      let email  = req.params.email;
      var passwd = req.body.pwd;

      var ret = dbio.updUserPasswd([email, passwd]);
      return misc.response({ code: 200, message: "OK" }, req, res);
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //
    // FCM
    //
    app.get('/fcm/:id', (req, res) => {
      let id = req.params.id;

      var ret = dbio.getFcmId([id]);
      res.contentType("application/json")
      res.send(JSON.stringify(ret));
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //
    // Receipt
    //
    app.get('/receipt', (req, res) => {
      var ret = dbio.getReceipt();
      res.contentType("application/json")
      res.send(JSON.stringify(ret));
    });

    app.get('/receipt/:email', (req, res) => {
      let email = req.params.email;
      var ret = dbio.getReceiptEmail([email]);
      res.contentType("application/json")
      res.send(JSON.stringify(ret));
    });
    app.get('/receipt/:email/:from', (req, res) => {
      let email = req.params.email;
      let from  = req.params.from;
      var ret = dbio.getReceiptEmailFrom ([email, from]);
      res.contentType("application/json")
      res.send(JSON.stringify(ret));
/*
      dbio.getReceiptEmailFrom(email, from, function(e, r) {
        res.contentType("application/json")
        res.send(r);
      });
*/
    });

    app.post('/receipt/:license', (req, res) => {
      let license = req.params.license;
      let data    = escp.parse(req.body.Data);

      dbio.delQRcodeExpire([180]);
      pdf.write(data, null, function(name, path_pdf) {
        txt.write(data, name, function(name, path_txt) {
          var ret = dbio.getIssueLicense ([license]);
          console.log(ret);
          if(ret.length < 1) {
            res.send(req.body.Data);
          }
          else {
            let email  = ret[0].email;

            var ret = dbio.getUserEmail([email]);
            let fcmkey = ret[0].fcmkey;

            parser.open(data, function(obj) {
              var name     = obj.name; 
              var register = obj.register;
              var tel      = obj.tel; 
              var address  = obj.address; 
              var url_txt  = process.env.SERVER + '/' + path_txt; 
              var url_pdf  = process.env.SERVER + '/' + path_pdf;
              var url_cpn  = process.env.SERVER + '/store/' + license;
              var total    = misc.toint(obj.total); 
              var cash     = misc.toint(obj.cash); 
              var card     = misc.toint(obj.card);
              var dt       = obj.date;

              var ret = dbio.putReceipt([email, name, register, tel, address, url_txt, url_pdf, total, cash, card, dt]);
              var ret = dbio.putFcm ([email, name, total, dt, url_pdf, url_txt, url_cpn]);
              console.log(ret);
              fcm.message(process.env.KEY_FCM, fcmkey, process.env.SERVER + '/fcm/' + ret.insertId);
              var ret = dbio.delIssueEmail  ([email]);
              misc.response({ code: 200, message: "OK" }, req, res);
              //res.send(req.body.Data);
            });
          }
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
      var ret = dbio.getQRcode();
      res.contentType("application/json")
      res.send(JSON.stringify(ret));
    });

    app.get('/qrcode/:email', function(req, res){
      var email   = req.params.email;
      let gen     = misc.generateQRcode();

      var ret = dbio.delQRcodeEmail ([email]);
      var ret = dbio.delIssueEmail  ([email]);
      var ret = dbio.putQRcode([email, gen]);
      res.contentType("application/json")
      misc.response({ code: 200, message: "OK", id: email, qrcode: gen, }, req, res);
    });

    app.get('/issue', function(req, res){
      var ret = dbio.getIssue();
      res.contentType("application/json")
      res.send(JSON.stringify(ret));
    });
    app.get('/issue/:license/:qrcode', function(req, res){
      var license = req.params.license;
      var qrcode  = req.params.qrcode;

      console.log(qrcode);
      if(qrcode.indexOf('CP') >= 0) {
        ws.send(qrcode);
      }
      else if(qrcode.indexOf('QR') >= 0) {
        var ret = dbio.getQRcodeQRcode([qrcode]);
        console.log(ret);
        var email = ret[0].email;
        if(ret.length > 0) {
          var ret = dbio.delIssueLicense([license]);
          console.log(ret);
          var ret = dbio.putIssue([email, license]);
          console.log(ret);
          misc.response({code: 200, message: "OK"}, req, res);
        }
        else {
          misc.response({ code: 404, message: "Not Found!" }, req, res);
        }
      }
      else {
        misc.response({ code: 405, message: "Not Found!" }, req, res);
      }
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //
    // License 
    //
    app.get('/license/:mac', function(req, res){
      var mac   = req.params.mac;
      let gen     = misc.generate();

      var ret = dbio.delLicenseMac ([mac]);
      var ret = dbio.putLicenses ([mac, gen]);
      misc.response({ code: 200, message: "OK", id: mac, license: gen, }, req, res);
    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //
    // Coupon
    //
    app.get('/coupon', function(req, res){
      var ret = dbio.getCoupon([]);
      res.contentType("application/json")
      res.send(JSON.stringify(ret));
    });

    app.get('/coupon/:email', function(req, res){
      var email   = req.params.email;

      var ret = dbio.getCouponEmail([email]);
      res.contentType("application/json")
      res.send(JSON.stringify(ret));
    });

    app.get('/store/:license', function(req, res){
      var license   = req.params.license;
      var ret = dbio.getStoreLicense ([license]);
      if(ret.length < 1) {
        misc.response({ code: 404, message: "Not Found!" }, req, res);
      }
      else {
        var register = ret[0].register;
        var ret = dbio.getGroupCouponRegister([register]);
        if(ret.length > 0) ret[0].generate = process.env.SERVER + '/publish/coupon/' + register + '/'
        res.contentType("application/json")
        res.send(JSON.stringify(ret));
      }
    });

    app.get('/coupon/:license', function(req, res){
      var license   = req.params.license;
      var ret = dbio.getStoreLicense ([license]);
      if(ret.length < 1) {
        misc.response({ code: 404, message: "Not Found!" }, req, res);
      }
      else {
        var register = ret[0].register;
        var ret = dbio.getGroupCouponRegister([register]);
        if(ret.length > 0) ret[0].generate = process.env.SERVER + '/publish/coupon/' + register + '/'
        res.contentType("application/json")
        res.send(JSON.stringify(ret));
      }
    });


    app.get('/publish/coupon/:register/:email', function(req, res){
      var register  = req.params.register;
      var email     = req.params.email;

      var ret = dbio.getGroupCouponRegister([register]);
      if(ret.length < 1) {
        misc.response({ code: 404, message: "Not Found!" }, req, res);
      }
      else {
        console.log(ret);
        var id       = ret[0].id;
        var name     = ret[0].name;
        var register = ret[0].register;
        var title    = ret[0].title;
        var genre    = ret[0].genre;
        var begins   = moment(ret[0].begins).format("YYYY-MM-DD HH:mm:ss");
        var ends     = moment(ret[0].ends).format("YYYY-MM-DD HH:mm:ss");

        var ret      = dbio.putCoupon([email, misc.generateCoupon(), 0, id, name, register, title, genre, begins, ends]);
        var ret      = dbio.getCouponId([ret.insertId]);
        res.contentType("application/json")
        res.send(JSON.stringify(ret));
      }
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
