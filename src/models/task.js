const mongoose = require("mongoose");
const validator = require("validator");

const taskSchema = new mongoose.Schema(
	{
		description: {
			type: String,
			required: true,
			trim: true,
		},
		completed: {
			type: Boolean,
			default: false,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId, // owner tipi bir başka schemanın dokümanının object id si
			required: true,
			ref: "User", // başka bir Modeli referans ettik.
		},
	},
	{ timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
