// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var session = require('express-session');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var logger 	 = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var dataDBurl = 'localhost/data_db';
var collections = ['data'];
var dataDB = require('mongojs').connect(dataDBurl , collections);

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.use(express.static(__dirname + '/webapp'));

// set up our express application
app.use(logger('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));// get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for session
app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: 'ilovescotchscotchyscotchscotch' }));// session secret

// required for passport
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// dataDB api routes
var router = express.Router();
router.use(function(req, res, next){
	console.log('Something is happening.');
	next();
});
router.route('/data')
	.get(function(req, res) {
		dataDB.data.find(function(err, data) {
			if(err)
				res.send(err);
			res.json(data);
		});
	});

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
