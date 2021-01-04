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
    console.log('dbio.init');
    db.init (process.env.DB_NAME, process.env.DB_HOSTNAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, process.env.DB_DATABASE, verbose);
  },
  getUser: function() {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM users");
  },
  getUserId: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM users WHERE id = ?", record);
  },
  getUserEmail: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM users WHERE email = ?", record);
  },
  getUserEmailPass: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM users WHERE email = ? AND passwd = ?", record);
  },
  delUser: function() {
    if(db.handle() == null) this.init ();
    return db.query("DELETE FROM users");
  },
  delUserId: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("DELETE FROM users WHERE id = ?", record);
  },
  delUserEmail: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("DELETE FROM users WHERE email = ?", record);
  },
  updUser: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("UPDATE users SET fcmkey = ? WHERE email = ?", record);
  },
  updUserPasswd: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("UPDATE users SET passwd = ? WHERE email = ?", record);
  },
  putUser: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("INSERT INTO users (email, passwd) VALUES (?, ?)", record);
  },

  getReceiptId: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM receipt WHERE id = ?", record);
  },
  getReceiptEmail: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM receipt WHERE email = ?", record);
  },
  getReceiptIdEmail: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM receipt WHERE id > ? AND email = ?", record);
  },
  getReceipt: function() {
    console.log('getReceipt');
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM receipt");
  },
  getReceiptEmailFrom: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM receipt WHERE email = ? AND UNIX_TIMESTAMP(ts) > ?", record);
  },
  putReceipt: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("INSERT INTO receipt (email, name, register, tel, address, text, pdf, total, cash, card, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", record);
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // QRcode
  //
  getQRcode: function() {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM qrcode");
  },
  getQRcodeEmail: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM qrcode WHERE email = ?", record);
  },
  getQRcodeQRcode: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM qrcode WHERE qrcode = ?", record);
  },
  delQRcodeEmail: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("DELETE FROM qrcode WHERE email = ?", record);
  },
  delQRcodeQRcode: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("DELETE FROM qrcode WHERE qrcode = ?", record);
  },
  delQRcodeExpire: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("DELETE FROM qrcode WHERE ts < NOW() - INTERVAL ? SECOND", record);
  },
  putQRcode: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("INSERT INTO qrcode (email, qrcode) VALUES (?, ?)", record);
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // Issue
  //
  getIssue: function() {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM issue", record);
  },
  getIssueEmail: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM issue WHERE email = ?", record);
  },
  getIssueLicense: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM issue WHERE license = ?", record);
  },
  delIssueEmail: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("DELETE FROM issue WHERE email = ?", record);
  },
  delIssueLicense: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("DELETE FROM issue WHERE license = ?", record);
  },
  delIssueExpire: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("DELETE FROM issue WHERE ts < NOW() - INTERVAL ? SECOND", record);
  },
  putIssue: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("INSERT INTO issue (email, license) VALUES (?, ?)", record);
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // Store
  //

  getStoreLicense: function (record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM store WHERE license = ?", record);
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // g Coupon
  //
  getGroupCoupon: function () {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM g_coupon");
  },

  getGroupCouponRegister: function (record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM g_coupon WHERE register = ?", record);
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //  Coupon
  //
  getCoupon: function (record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM coupon", record);
  },

  getCouponId: function (record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM coupon WHERE id = ?", record);
  },

  getCouponEmail: function (record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM coupon WHERE email = ?", record);
  },

  getCouponCode: function (record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM coupon WHERE cpcode = ?", record);
  },

  updCouponCodeUsed: function (record) {
    if(db.handle() == null) this.init ();
    return db.query("UPDATE coupon SET used = 1 WHERE cpcode = ?", record);
  },

  putCoupon: function (record) {
    if(db.handle() == null) this.init ();
    return db.query("INSERT INTO coupon (email, cpcode, used, g_coupon_id, name, register, title, genre, begins, ends) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", record);
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // License
  //
  delLicenseMac: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("DELETE FROM license WHERE mac = ?", record);
  },
  putLicenses: function(records) {
    if(db.handle() == null) this.init ();
    return db.query("INSERT INTO license (mac, license) VALUES (?, ?)", record);
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // FCM
  //
  putFcm: function(record) {
    if(db.handle() == null) this.init ();
    if(verbose) console.log(records);
    return db.query("INSERT INTO fcm (email, name, total, issue, pdf, text, coupon) VALUES (?, ?, ?, ?, ?, ? ,?)", record);
  },
  getFcmId: function(record) {
    if(db.handle() == null) this.init ();
    return db.query("SELECT * FROM fcm WHERE id = ?", record);
  },

};
