//let dotenv  = require('dotenv').config();
let misc    = require('./libs/misc.js');
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

misc.exists('./.env', function(exists) {
  if(!exists) console.log("Environment file (.env) not found");
});


https.listen (app);

module.exports = app;
