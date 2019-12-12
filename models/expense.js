var mongoose = require("mongoose");

var expenseSchema = mongoose.Schema({
	mainUser: {type: mongoose.Schema.Types.ObjectId,  ref: 'User'},
	subUser: String,
	date: String,
	desc: String,
	amount: Number,
});

// var paidExpenseSchema = mongoose.Schema({
// 	mainUser: {type: mongoose.Schema.Types.ObjectId,  ref: 'User'},
// 	subUser: String,
// 	date: String,
// 	desc: String,
// 	amount: Number,
// });

// var receivedExpenseSchema = mongoose.Schema({
// 	mainUser: {type: mongoose.Schema.Types.ObjectId,  ref: 'User'},
// 	subUser: String,
// 	date: String,
// 	desc: String,
// 	amount: Number,
// });

module.exports = mongoose.model("Expense", expenseSchema);

