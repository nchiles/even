var express 	  	= require('express'),
	app     	  	= express(),
	bodyParser 	  	= require('body-parser'),
	mongoose 	  	= require("mongoose"),
	passport	  	= require("passport"),
	LocalStrategy 	= require("passport-local"),
	User 			= require("./models/user"),
	methodOveride   = require("method-override"),
	port 			= process.env.PORT || 5000

mongoose.connect("mongodb://nate:R4UmKVZmYxM*ERWP@ds131329.mlab.com:31329/even-app"); //live database for app
// mongoose.connect("mongodb://localhost:27017/couples_budget"); //local database for testing

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); //reads a form's input and stores it as a javascript object accessible through req.body
app.set("view engine", "ejs");
app.use(express.static('public')); //serves static files such as images, CSS files, and JavaScript files
app.use(methodOveride("_method")) //used for editing and updating

mongoose.Promise = global.Promise;
//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "cannery bitter rumble assent clarity clasp",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
})

//KEEP HEROKU APP AWAKE
var http = require("http");
// setInterval(function() {
// 	console.log("index 5 minute get sent");
//     http.get("http://evenexpense.herokuapp.com");
// }, 900000); // every 5 minutes

var expenseSchema = new mongoose.Schema({
	mainUser: {type: mongoose.Schema.Types.ObjectId,  ref: 'User'},
	subUser: String,
	date: String,
	desc: String,
	amount: Number,
});

var archiveSchema = new mongoose.Schema({
	mainUser: {type: mongoose.Schema.Types.ObjectId,  ref: 'User'},
	subUser: String,
	date: String,
	desc: String,
	amount: Number,
},{ collection: 'archived' });


var Expense = mongoose.model("Expense", expenseSchema);
var Archive = mongoose.model("Archive", archiveSchema);

// ==============
//  AUTH ROUTES
// ==============

app.get("/", function(req,res){
	res.redirect("register");
});

// show register form
app.get("/register", function(req,res){
	res.render("register");
});
//handle sign up logic
app.post("/register", function(req,res){
	var newUser = new User({
		username: req.body.username,
		userA: req.body.userA,
		userB: req.body.userB
	});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("register")
		}
		passport.authenticate("local")(req, res, function(){
			// create 0 expense
		    var mainUser    = req.user;
		    var newExpense 	= {mainUser: mainUser, subUser: "userA", amount: 0};
		    Expense.create(newExpense, function(err, newlyCreatedA){
		        if(err){
		            console.log(err);
		        } else {
		        	console.log(newlyCreatedA);
		        	var mainUser    = req.user;
		    		var newExpense 	= {mainUser: mainUser, subUser: "userB", amount: 0};
		        	Expense.create(newExpense, function(err, newlyCreatedB){
		        		if(err){
		            		console.log(err);
		        		} else {
		        			console.log(newlyCreatedB);
		        		}

		        		var userATotal = 0,
	    					userBTotal = 0;
						Expense.aggregate([
							{ $match : { mainUser: req.user._id } },
							{ $match : { subUser : "userA" } },
							{ $group : { 
								_id: "null", 
								aTotal: { $sum: { $add: ["$amount"] }}}}
							], function (err, result1) {
								if (err) {
									res.redirect("/");
									console.log(err);
								} else {
									userATotal = result1[0].aTotal;
									console.log(userATotal);

									Expense.aggregate([
										{ $match : { mainUser: req.user._id } },
										{ $match : { subUser : "userB" } },
										{ $group : { 
											_id: "null", 
											bTotal: { $sum: { $add: ["$amount"] }}}}
										], function (err, result2) {
											if (err) {
												console.log(err);
											} else {
												userBTotal = result2[0].bTotal;
												console.log(userBTotal);

												totalSpent = userATotal + userBTotal;
												console.log(totalSpent);

												aOwesB = (totalSpent / 2) - userATotal;
												bOwesA = (totalSpent / 2) - userBTotal;
												
												res.redirect("new");
											}
									});
								}
						});
					});								
				};	
			
			});
		});
	});
});

// show login form
app.get("/login", function(req,res){
	res.render("login");
});

//logic route
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("login");
});

//handle login logic
app.post("/login", passport.authenticate("local",
	{
		successRedirect: "new",
		failureRedirect: "login"
	}), function(req, res){
	var userATotal = 0,
	    userBTotal = 0;
	Expense.aggregate([
		{ $match : { mainUser: req.user._id } },
		{ $match : { subUser : "userA" } },
		{ $group : { 
			_id: "null", 
			aTotal: { $sum: { $add: ["$amount"] }}}}
		], function (err, result1) {
			if (err) {
				res.redirect("/");
				console.log(err);
			} else {
				userATotal = result1[0].aTotal;
				console.log(userATotal);

				Expense.aggregate([
					{ $match : { mainUser: req.user._id } },
					{ $match : { subUser : "userB" } },
					{ $group : { 
						_id: "null", 
						bTotal: { $sum: { $add: ["$amount"] }}}}
					], function (err, result2) {
						if (err) {
							console.log(err);
						} else {
							userBTotal = result2[0].bTotal;
							console.log(userBTotal);

							totalSpent = userATotal + userBTotal;
							console.log(totalSpent);

							aOwesB = (totalSpent / 2) - userATotal;
							bOwesA = (totalSpent / 2) - userBTotal;
							
						}
				});
			}
	});
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("login");
}

//SHOW ADD EXPENSE FORM
app.get("/new", isLoggedIn, function(req, res){
	var userATotal = 0,
	    userBTotal = 0;
	Expense.aggregate([
		{ $match : { mainUser: req.user._id } },
		{ $match : { subUser : "userA" } },
		{ $group : { 
			_id: "null", 
			aTotal: { $sum: { $add: ["$amount"] }}}}
		], function (err, result1) {
			if (err) {
				res.redirect("/");
				console.log(err);
			} else {
				userATotal = result1[0].aTotal;
				// console.log(userATotal);

				Expense.aggregate([
					{ $match : { mainUser: req.user._id } },
					{ $match : { subUser : "userB" } },
					{ $group : { 
						_id: "null", 
						bTotal: { $sum: { $add: ["$amount"] }}}}
					], function (err, result2) {
						if (err) {
							console.log(err);
						} else {
							userBTotal = result2[0].bTotal;
							// console.log(userBTotal);

							totalSpent = userATotal + userBTotal;
							// console.log(totalSpent);

							aOwesB = (totalSpent / 2) - userATotal;
							bOwesA = (totalSpent / 2) - userBTotal;
							res.render("new");
						}
				});
			}
	});
	
});

app.post("/new", isLoggedIn, function(req, res){
    // get data from form and add to expense table
    var mainUser    = req.user;
    var subUser    	= req.body.subUser;
    var date 		= req.body.date;
    var desc 		= req.body.desc;
    var amount		= req.body.amount;

    var newExpense 	= {
		mainUser: mainUser, 
		subUser: subUser, 
		date: date, 
		desc: desc, 
		amount: amount
	};

    // create expense
    Expense.create(newExpense, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
        	console.log('expense created');
        }
	});
	Archive.create(newExpense, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
        	console.log('archived expense created');
        }
    });
});

app.get("/header", isLoggedIn, function(req, res){
	var userATotal = 0,
	    userBTotal = 0;
	Expense.aggregate([
		{ $match : { mainUser: req.user._id } },
		{ $match : { subUser : "userA" } },
		{ $group : { 
			_id: "null", 
			aTotal: { $sum: { $add: ["$amount"] }}}}
		], function (err, result1) {
			if (err) { 
				res.redirect("/");
				console.log(err);
			} else {
				userATotal = result1[0].aTotal;
				// console.log(userATotal);

				Expense.aggregate([
					{ $match : { mainUser: req.user._id } },
					{ $match : { subUser : "userB" } },
					{ $group : { 
						_id: "null", 
						bTotal: { $sum: { $add: ["$amount"] }}}}
					], function (err, result2) {
						if (err) {
							console.log(err);
						} else {
							userBTotal = result2[0].bTotal;
							// console.log(userBTotal);

							totalSpent = userATotal + userBTotal;
							// console.log(totalSpent);

							aOwesB = (totalSpent / 2) - userATotal;
							bOwesA = (totalSpent / 2) - userBTotal;
							res.render("header", {expense: aOwesB, bOwesA});
						}
				});
			}
	});
	
});

//show expense page plus add up expenses and do math 
app.get("/show_expenses", isLoggedIn, function(req, res){
	Expense.find({}, function(err, allexpenses) {
		if(err){
			res.redirect("/");
			console.log(err);
		} else {
			var userATotal = 0,
				userBTotal = 0;
			Expense.aggregate([
				{ $match : { mainUser: req.user._id } },
				{ $match : { subUser : "userA" } },
				{ $group : { 
					_id: "null", 
					aTotal: { $sum: { $add: ["$amount"] }}}}
				], function (err, result1) {
					if (err) {
						res.redirect("/");
						console.log(err);
					} else {
						userATotal = result1[0].aTotal;
						// console.log(userATotal);

						Expense.aggregate([
							{ $match : { mainUser: req.user._id } },
							{ $match : { subUser : "userB" } },
							{ $group : { 
								_id: "null", 
								bTotal: { $sum: { $add: ["$amount"] }}}
							}		
							], function (err, result2) {
								if (err) {
									console.log(err);
								} else {
									userBTotal = result2[0].bTotal;
									// console.log(userBTotal);

									totalSpent = userATotal + userBTotal;
									// console.log(totalSpent);

									aOwesB = (totalSpent / 2) - userATotal;
									bOwesA = (totalSpent / 2) - userBTotal;
									
									res.render("show_expenses", {expense: allexpenses, userBTotal, userATotal});
								}
							});	
						}
					});
				}
			}).sort({"date": 1});;
})

//show archive page
app.get("/archive", isLoggedIn, function(req, res){
	Archive.find({}, function(err, allexpenses) {
		if(err){
			res.redirect("/");
			console.log(err);
		} else {
			Archive.aggregate([
				{ $match : { mainUser: req.user._id } },
				{ $match : { subUser : "userA" } },
				{ $group : { _id: "null" } }
			])

			Archive.aggregate([
				{ $match : { mainUser: req.user._id } },
				{ $match : { subUser : "userB" } },
				{ $group : { _id: "null", } }		
			])
			res.render("archive", {expense: allexpenses});
			} 
		}).sort({"date": 1});
	});

// EDIT
app.get('/:id/edit', function(req, res){
	Expense.findById(req.params.id, function(err, foundExpense){
		if(err){
			// res.redirect("show_expenses");
			console.log(err);
		} else {
			res.render("edit", {expense: foundExpense})
		}
	})
});

// UPDATE
app.put('/:id', function(req, res){
	Expense.findByIdAndUpdate(req.params.id, req.body.expense, function(err, updatedExpense){
		if(err) {
			res.send("error");
		} else {
			res.redirect("show_expenses");
		}
	});
});

// DELETE
app.get('/delete/:id', function(req, res){
	Expense.remove({_id: req.params.id}, 
	   function(err){
		if(err) res.json(err);
		else {
		var userATotal = 0,
	    	userBTotal = 0;
		Expense.aggregate([
			{ $match : { mainUser: req.user._id } },
			{ $match : { subUser : "userA" } },
			{ $group : { 
				_id: "null", 
				aTotal: { $sum: { $add: ["$amount"] }}}}
			], function (err, result1) {
				if (err) {
					console.log(err);
				} else {
					userATotal = result1[0].aTotal;
					// console.log(userATotal);

					Expense.aggregate([
						{ $match : { mainUser: req.user._id } },
						{ $match : { subUser : "userB" } },
						{ $group : { 
							_id: "null", 
							bTotal: { $sum: { $add: ["$amount"] }}}}
						], function (err, result2) {
							if (err) {
								console.log(err);
							} else {
								userBTotal = result2[0].bTotal;
								console.log(userBTotal);

								totalSpent = userATotal + userBTotal;
								console.log(totalSpent);

								aOwesB = (totalSpent / 2) - userATotal;
								bOwesA = (totalSpent / 2) - userBTotal;
							}
					});
				}
	});	
		res.redirect('/show_expenses');
		}
	});
});	  

app.listen(port, function() {
	console.log("App is running on port " + port);	
})
