'use strict';

module.exports = {
  message: function(Key, To, Url) {
    console.log('key', Key);
    console.log('to',  To);
    console.log('url', Url);

    let FCM = require('fcm-node');
    let fcm = new FCM(Key);
    var msg = {
      to: To,
      notification: {
        title: '전지영수증이 발급되었습니다.',
        body: '---'
      },
      data: {
        receipt: Url
      }
    };
    fcm.send(msg, function(e, r){
      if (e) console.log("Something has gone wrong!");
      else   console.log("Successfully sent with response: ", r);
    });
  }
};

