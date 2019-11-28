var mongoose = require("mongoose");

var archiveSchema = new mongoose.Schema({
	mainUser: {type: mongoose.Schema.Types.ObjectId,  ref: 'User'},
	subUser: String,
	date: String,
	desc: String,
	amount: Number
},{ collection: 'archived' });

module.exports = mongoose.model("Archive", archiveSchema);