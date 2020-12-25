let dotenv  = require('dotenv').config();
let fs      = require('fs');
let https   = require('./libs/https.js');
let router  = require('./router.js');
let envfile = require('envfile')

let express = require('express');
let app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(__dirname + '/public'));

// for ENV update
//dotenv.parsed.test='test';
//console.log(dotenv.parsed);
//fs.writeFileSync('./.t', envfile.stringify(dotenv.parsed)); 
router.init(app);

//let expire = process.env.EXPIRE;
//timer.interval(1, function() {
//  dbio.delQrcodeExpire (expire);
//});

https.listen (app);

module.exports = app;
