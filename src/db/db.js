const mongoose = require("mongoose");

require('dotenv').config() // process.env variable larına ulaşmak için...

// mongodb://127.0.0.1:27017/task-manager-api  *** localhost

mongoose.connect(process.env.DB_CONNECTION_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false, // findOneAndUpdate()` and `findOneAndDelete()` without the `useFindAndModify` option set to false are deprecated. --- Bununla ilgili deprecation warning almamak için ekledik.
});
