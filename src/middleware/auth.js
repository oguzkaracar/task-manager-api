const jwt = require("jsonwebtoken");
const User = require("../models/user");

require('dotenv').config()

// middleware ile gelen requestleri kontrol edicez..
// app.use((req, res, next) => {
// 	// if(req.method ==='GET'){
// 	// 	res.send('GET requests are disabled')
// 	// }else{
// 	// 	next()
// 	// }

// 	res.status(503).send('Maintenance mode')
// });

// userlar authentication a sahip mi diye kontrol edicez..

const auth = async (req, res, next) => {
	try {
		const token = req.header("Authorization").replace("Bearer ", "");

		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

		const user = await User.findOne({ _id: decoded._id, "tokens.token": token });

        if (!user) throw new Error();
        

        req.token = token; 
        req.user = user;
         // user burada fetch edildi zaten. req olarak route handler a direkt olarak gönderebiliriz. route handler da boşuna fetch işlemi yapılmasın..
        
		next();
	} catch (error) {
		res.status(401).send({ error: "Please authenticate." });
    }
  
};

module.exports = auth;
