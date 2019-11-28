//REMEMBER: for production, change DB & comment out first line (dotenv), then add var before express
var dotenv			= require('dotenv').config(),
	express 	  	= require('express'),
	app     	  	= express(),
	bodyParser 	  	= require('body-parser'),
	mongoose 	  	= require("mongoose"),
	passport	  	= require("passport"),
	LocalStrategy 	= require("passport-local"),
	flash 			= require('connect-flash'),
	User 			= require("./models/user"),
	methodOveride   = require("method-override"),
	port 			= process.env.PORT || 5000
	
// mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true }); //live database for app
mongoose.connect(process.env.MONGO_DB_TESTING, { useNewUrlParser: true }); //local database for testing

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); //reads a form's input and stores it as a javascript object accessible through req.body
app.set("view engine", "ejs");
app.use(express.static('public')); //serves static files such as images, CSS files, and JavaScript files
app.use(methodOveride("_method")) //used for editing and updating

//PASSPORT CONFIGURATION
app.use(require("express-session")({ 
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
})
app.use(flash());// use connect-flash for flash messages stored in session

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.Promise = global.Promise;

// routes
require('./routes')(app);

app.listen(port, function() {
	console.log("App is running on port " + port);	
})

