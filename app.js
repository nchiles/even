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
app.use(require("express-session")({ //PASSPORT CONFIGURATION
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
})
app.use(flash());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.Promise = global.Promise;

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
	amount: Number
},{ collection: 'archived' });

var Expense = mongoose.model("Expense", expenseSchema);
var Archive = mongoose.model("Archive", archiveSchema);

//REDIRECT ROOT TO REGISTER PAGE
app.get("/", function(req,res){
	res.redirect("register");
});

// SHOW REGISTER PAGE
app.get("/register", function(req,res){
	res.render("register");
});

// REGISTER LOGIC
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
			// create 0 expense so header can load on first run
			// var userid 			= req.user._id;
		    var mainUser        = req.user;
            var newExpenseA 	= {mainUser: mainUser, subUser: "userA", amount: 0};
            var newExpenseB 	= {mainUser: mainUser, subUser: "userB", amount: 0};
            var newExpenses     = [newExpenseA, newExpenseB];
		    Expense.insertMany(newExpenses, function(err, zeroExpenses){
		        if(err){
		            console.log(err);
		        } else {
					console.log(zeroExpenses);
					var userId = req.user._id;
					getResult(userId, function(){
						res.render("new");
					});
                }
            });
        });
	});
});

// SHOW LOGIN PAGE
app.get("/login", function(req,res){
	res.render("login", {expressFlash: req.flash('success') });
});

// LOGIN LOGIC
app.post("/login", passport.authenticate("local",
	{
		successRedirect: "new",
		failureRedirect: "login",
	})
);

// LOGOUT LOGIC
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("login");
});

// SHOW ADD EXPENSE PAGE
app.get("/new", isLoggedIn, function(req, res){
	//code for status bar
	userId = req.user._id;
	getResult(userId, function(){
		res.render("new");
	});
});

// CREATE NEW EXPENSE
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
	createExpenses(newExpense)
});

// SHOW PAYMENT FORM
app.get("/payment", isLoggedIn, function(req, res){
	userId = req.user._id;
	getResult(userId, function(){
		res.render("payment");
	});	
});

// MAKE FULL PAYMENT
app.post("/payment/full", isLoggedIn, function(req, res){
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
	createExpenses(newExpense);
	// res.redirect("/show_expenses")
});

// MAKE PARTIAL PAYMENT
app.post("/payment/partial", isLoggedIn, function(req, res){
    // get data from form and add to expense table
    var mainUser    = req.user;
    var subUser    	= req.body.subUser;
    var date 		= req.body.date;
    var desc 		= req.body.desc;
    var amount		= (req.body.amount) * 2;

    var newExpense 	= {
		mainUser: mainUser, 
		subUser: subUser, 
		date: date, 
		desc: desc, 
		amount: amount
	};

    // create expense
    createExpenses(newExpense)
	// res.redirect("/show_expenses")
});

// SHOW EXPENSE TABLES
app.get("/show_expenses", isLoggedIn, function(req, res){
	Expense.find({}, function(err, allexpenses) {
		if(err){
			res.redirect("/");
			console.log(err);
		} else {
			userId = req.user._id;
			getResult(userId, function(){
				res.render("show_expenses", { expense: allexpenses });
			});
		}
	}).sort({ "date": 1 });
})

//SHOW ARCHIVE PAGE
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

// EDIT EXPENSE
app.get('/:id/edit', function(req, res){
	Expense.findById(req.params.id, function(err, foundExpense){
		if(err){
			console.log(err);
		} else {
			res.render("edit", {expense: foundExpense})
		}
	})
});

// UPDATE EXPENSE
app.put('/:id', function(req, res){
	Expense.findByIdAndUpdate(req.params.id, req.body.expense, function(err){
		if(err) {
			res.send("error");
		} else {
			res.redirect("show_expenses");
		}
	});
});

// DELETE SINGLE EXPENSE
app.get('/delete/:id', function(req, res){
	Expense.deleteOne({_id: req.params.id}, 
	   function(err){
			if(err) res.json(err);
		else {
			userId = req.user._id;
			getResult(userId, function(){
				res.redirect("/show_expenses");
			});
		}
	})
});	 

// DELETE ALL EXPENSES
app.get('/delete/user/expenses', function(req, res){
	Expense.aggregate([
		{ $match : { mainUser: req.user._id } },
		{ $match : { amount : { $ne: 0 } }},
		], function (err, result) {
			if (err) {
				console.log(err);
			} else {
				result.forEach(function (doc){
					console.log({_id: doc._id})
					Expense.deleteOne({_id: doc._id}, function (err) {
						
					});
				});
			};
		});
	});

app.listen(port, function() {
	console.log("App is running on port " + port);	
})

//FUNCTIONS
//check if logged in
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("login");
}

//even calculation
function getResult(userId, callback){

    Expense.aggregate([ //gets total of user A
        { $match : { mainUser: userId } },
        { $match : { subUser : "userA" } },
        { $group : { _id: "null", aTotal: { $sum: { $add: ["$amount"] }}}}
        ], 
        function (err, result1) {
            if (err) {
                res.redirect("/");
                console.log(err);
            } else {
				userATotal = result1[0].aTotal;
				
                Expense.aggregate([//gets total of user B
                    { $match : { mainUser: userId } },
                    { $match : { subUser : "userB" } },
                    { $group : { _id: "null", bTotal: { $sum: { $add: ["$amount"] }}}}
                    ], 
                    function (err, result2) {
                        if (err) {
                            console.log(err);
                        } else {
                            userBTotal = result2[0].bTotal;

                            totalSpent = userATotal + userBTotal;

                            aOwesB = (totalSpent / 2) - userATotal;
							bOwesA = (totalSpent / 2) - userBTotal;
							callback()
                        }
                    }
                );
            }
        }
	);
}

//create new expenses
function createExpenses(newExpense){
	Expense.create(newExpense, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			console.log('expense created:' + newlyCreated);
		}
	});
	Archive.create(newExpense, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			console.log('archived expense created:' + newlyCreated);
		}
	});
}