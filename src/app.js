const express = require("express");
require("./db/db");
const userRoutes = require("./routes/user-routes");
const taskRoutes = require("./routes/task-routes.js");

const app = express();

app.use(express.json()); // json post requestlerini parse etmek ve json data göndermek için kullanırız.- gelen json dataları otomatik olarak parse eder.
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
// ------------------------------------------ ******  Routes ******** ----------------------------

// app.get("/", (req, res) => {
// 	res.send("Task Manager API");
// });


module.exports = app;

// ------------------ playground ------------

// const Task = require('./models/task');
// const User = require("./models/user");

// const main = async () =>{
// 	// const task = await Task.findById('5f5b6fb233c323294c2cc6c1')
// 	// await task.populate('owner').execPopulate() // bu taskla ilişkili olan user ı bulacak ve bize user documentını dönecek.
// 	// console.log(task.owner)

// 	const user = await User.findById('5f5b6f9433c323294c2cc6bf')
// 	await user.populate('tasks').execPopulate()
// 	console.log(user.tasks)

// }

// main()

// **** ---- multer kullanımı

// const multer = require("multer");

// const upload = multer({
// 	dest:'images',
// 	limits:{
// 		fileSize:1000000
// 	},
// 	fileFilter(req,file,cb){
		
// 		if (!file.originalname.match(/\.(doc|docx)$/)) {
// 			return cb(new Error('File must be a Word Document'))
// 		}

// 		cb(null,true)

// 		// cb(new Error('File must be a PDF'))
// 		// cb(undefined,true)

// 	}
// });


// app.post('/upload', upload.single('upload') ,(req,res) =>{
// 	res.send();
// },(error,req,res,next)=>{
// 	// burası eğer route handler error verirse çalışacak.
// 	res.status(400).send({error:error.message})
// })