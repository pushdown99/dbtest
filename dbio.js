'use strict';

const dotenv  = require('dotenv').config()
let   verbose = process.env.VERBOSE || false
verbose = (verbose == 'true');

var db = require('./libs/db.js');

//result.forEach(function(data) {
//  console.log('select: data.id => ', data.id);
//});

module.exports = {
  init: function() {
    db.init (process.env.DB_NAME, process.env.DB_HOSTNAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, process.env.DB_DATABASE, verbose);
  },
  getUser: function(callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM users", function(e, r) {
      if(callback) callback (e, r);
    });
  },
  getUserId: function(id, callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM users WHERE id = ?", [id], function(e, r) {
      if(callback) callback (e, r);
    });
  },
  getUserEmail: function(email, callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM users WHERE email = ?", [email], function(e, r) {
      if(callback) callback (e, r);
    });
  },
  delUser: function(callback=null) {
    if(db.handle() == null) this.init();
    db.query("DELETE FROM users", function(e, r) {
      if(callback) callback (e, r);
    });
  },
  delUserId: function(id, callback=null) {
    if(db.handle() == null) this.init();
    db.query("DELETE FROM users WHERE id = ?", [id], function(e, r) {
      if(callback) callback (e, r);
    });
  },
  delUserEmail: function(email, callback=null) {
    if(db.handle() == null) this.init();
    db.query("DELETE FROM users WHERE email = ?", [email], function(e, r) {
      if(callback) callback (e, r);
    });
  },
  updUser: function(email, fcmkey, callback=null) {
    if(db.handle() == null) this.init();
    if(verbose) console.log(records);
    db.query("UPDATE users SET fcmkey = ? WHERE email = ?", [fcmkey, email], function (e, r) {
      if(callback) callback (e, r);
    });
  },
  updUserPasswd: function(email, passwd, callback=null) {
    if(db.handle() == null) this.init();
    if(verbose) console.log(records);
    db.query("UPDATE users SET passwd = ? WHERE email = ?", [passwd, email], function (e, r) {
      if(callback) callback (e, r);
    });
  },
  putUser: function(records, callback=null) {
    if(db.handle() == null) this.init();
    if(verbose) console.log(records);
    db.query("INSERT INTO users (email, passwd) VALUES ?", [records], function (e, r) {
      if(callback) callback (e, r);
    });
  },

  getReceiptId: function(id, callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM receipt WHERE id = ?", [id], function(e, r) {
      if(callback) callback (e, r);
    });
  },
  getReceiptEmail: function(email, callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM receipt WHERE email = ?", [email], function(e, r) {
      if(callback) callback (e, r);
    });
  },
  getReceiptIdEmail: function(id, email, callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM receipt WHERE id > ? AND email = ?", [id, email], function(e, r) {
      if(callback) callback (e, r);
    });
  },
  getReceipt: function(callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM receipt", function(e, r) {
      if(callback) callback (e, r);
    });
  },
  getReceiptEmailFrom: function(email, from, callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM receipt WHERE email = ? AND UNIX_TIMESTAMP(ts) > ?", [email, from], function(e, r) {
      if(callback) callback (e, r);
    });
  },
  putReceipt: function(records, callback=null) {
    if(db.handle() == null) this.init();
    if(verbose) console.log(records);
    db.query("INSERT INTO receipt (email, name, register, tel, address, text, pdf, total, cash, card, ts) VALUES ?", [records], function (e, r) {
      if(callback) callback (e, r);
    });
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // QRcode
  //
  getQRcode: function(callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM qrcode", function(e, r) {
      if(callback) callback (e, r);
    });
  },
  getQRcodeEmail: function(email, callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM qrcode WHERE email = ?", [email], function(e, r) {
      if(callback) callback (e, r);
    });
  },
  getQRcodeQRcode: function(qrcode, callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM qrcode WHERE qrcode = ?", [qrcode], function(e, r) {
      if(callback) callback (e, r);
    });
  },
  delQRcodeEmail: function(email, callback=null) {
    if(db.handle() == null) this.init();
    db.query("DELETE FROM qrcode WHERE email = ?", email, function(e, r) {
      if(callback) callback (e, r);
    });
  },
  delQRcodeQRcode: function(qrcode, callback=null) {
    if(db.handle() == null) this.init();
    db.query("DELETE FROM qrcode WHERE qrcode = ?", qrcode, function(e, r) {
      if(callback) callback (e, r);
    });
  },
  delQRcodeExpire: function(expire, callback=null) {
    if(db.handle() == null) this.init();
    db.query("DELETE FROM qrcode WHERE ts < NOW() - INTERVAL ? SECOND", expire, function(e, r) {
      if(callback) callback (e, r);
    });
  },
  putQRcode: function(records, callback=null) {
    if(db.handle() == null) this.init();
    if(verbose) console.log(records);
    db.query("INSERT INTO qrcode (email, qrcode) VALUES ?", [records], function (e, r) {
      if(callback) callback (e, r);
    });
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // Issue
  //
  getIssue: function(callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM issue", function(e, r) {
      if(callback) callback (e, r);
    });
  },
  getIssueEmail: function(email, callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM issue WHERE email = ?", [email], function(e, r) {
      if(callback) callback (e, r);
    });
  },
  getIssueLicense: function(license, callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM issue WHERE license = ?", [license], function(e, r) {
      if(callback) callback (e, r);
    });
  },
  delIssueEmail: function(email, callback=null) {
    if(db.handle() == null) this.init();
    db.query("DELETE FROM issue WHERE email = ?", email, function(e, r) {
      if(callback) callback (e, r);
    });
  },
  delIssueLicense: function(license, callback=null) {
    if(db.handle() == null) this.init();
    db.query("DELETE FROM issue WHERE license = ?", license, function(e, r) {
      if(callback) callback (e, r);
    });
  },
  delIssueExpire: function(expire, callback=null) {
    if(db.handle() == null) this.init();
    db.query("DELETE FROM issue WHERE ts < NOW() - INTERVAL ? SECOND", expire, function(e, r) {
      if(callback) callback (e, r);
    });
  },
  putIssue: function(records, callback=null) {
    if(db.handle() == null) this.init();
    if(verbose) console.log(records);
    db.query("INSERT INTO issue (email, license) VALUES ?", [records], function (e, r) {
      if(callback) callback (e, r);
    });
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // License
  //
  delLicenseMac: function(mac, callback=null) {
    if(db.handle() == null) this.init();
    db.query("DELETE FROM license WHERE mac = ?", mac, function(e, r) {
      if(callback) callback (e, r);
    });
  },
  putLicenses: function(records, callback=null) {
    if(db.handle() == null) this.init();
    if(verbose) console.log(records);
    db.query("INSERT INTO license (mac, license) VALUES ?", [records], function (e, r) {
      if(callback) callback (e, r);
    });
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // FCM
  //
  putFcm: function(records, callback=null) {
    if(db.handle() == null) this.init();
    if(verbose) console.log(records);
    db.query("INSERT INTO fcm (email, name, total, issue, pdf, text, coupon) VALUES ?", [records], function (e, r) {
      if(callback) callback (e, r);
    });
  },
  getFcmId: function(id, callback=null) {
    if(db.handle() == null) this.init();
    db.query("SELECT * FROM fcm WHERE id = ?", [id], function(e, r) {
      if(callback) callback (e, r);
    });
  },


};
