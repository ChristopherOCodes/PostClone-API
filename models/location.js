const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const locationSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
	creator: {
		type: mongoose.Types.ObjectId,
		ref: "User",
	},
});

module.exports = mongoose.model("Location", locationSchema);
