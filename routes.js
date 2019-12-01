var passport    = require('passport'),
    User        = require('./models/user'),
    Expense		= require('./models/expense'),
    Archive 	= require('./models/archive')

module.exports = function (app) {

    //REDIRECT ROOT TO REGISTER PAGE
    app.get("/", function(req,res){
        res.redirect("register", {message: req.flash('error')});
    });

    // SHOW REGISTER PAGE
    app.get("/register", function(req,res){
        res.render("register", {message: req.flash('error')});
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
                res.render("register", {message: 'error'})
            }
            passport.authenticate("local", (req, res, function(){
                // create 0 expense so header can load on first run
                // var userid 			= req.user._id;
                var mainUser        = req.user;
                    newExpenseA 	= {mainUser: mainUser, subUser: "userA", amount: 0};
                    newExpenseB 	= {mainUser: mainUser, subUser: "userB", amount: 0};
                    newExpenses     = [newExpenseA, newExpenseB];
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
            }));
        });
    });

    // SHOW LOGIN PAGE
    app.get("/login", function(req,res){
        res.render("login", {message: req.flash('error')});
    });

    // LOGIN LOGIC
    app.post("/login", passport.authenticate("local",
        {
            successRedirect: "new",
            failureRedirect: "login",
            failureFlash: true
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

};
