const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const router = express.Router(); // express Router metodu.
const multer = require("multer");
const sharp = require("sharp")
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/account')


// --****------------ Users Routes -------------*****----

// user ekle - signup
router.post("/", async (req, res) => {
	// user isimli variable d req. den gelen veriler User modeline göre ekledik.
	const user = new User(req.body);
	try {
		
		await user.save(); // user documents datasını database e ekleme işlemi...
		sendWelcomeEmail(user.email, user.name) // uygulamaya yeni kayıt olan kullanıcılara email göndericez..
		const token = await user.generateAuthToken(); //token oluşturulacak
		res.status(201).send({ user, token });
	} catch (error) {
		res.status(400).send(error);
	}
});

// User login
router.post("/login", async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken(); // token oluşturulacak.
		res.send({ user, token });
	} catch (error) {
		res.status(400).send(error);
	}
});

// kullanıcı authenticationını sonlandırma- logout işlemi..
router.post("/logout", auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token;
		});
		await req.user.save();
		res.send();
	} catch (error) {
		res.status(500).send();
	}
});

// Bütün tokenları silme. 
router.post("/logoutAll", auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send();
	} catch (error) {
		res.status(500).send();
	}
});

// user profile getir.
router.get("/me", auth, async (req, res) => {
	// try {
	// 	const users = await User.find({});
	// 	res.send(users);
	// } catch (error) {
	// 	res.status(500).send(error);
	// }

	// authentication sonrası
	res.send(req.user);
});

// isme göre 1 tane user getir.
// router.get("/:name", async (req, res) => {
// 	const userName = req.params.name;
// 	console.log(userName);
// 	// findOne metoduyla isme göre kullanıcı getirdik. -- id kullanmak istersek de findById metodunu kullanabiliriz...
// 	try {
// 		const user = await User.findOne({ name: userName });
// 		if (!user) return res.status(404).send();
// 		res.send(user);
// 	} catch (error) {
// 		res.status(500).send(error);
// 	}
// });

// User documents update - user güncelleme
router.patch("/me", auth, async (req, res) => {
	// sadece users documenttaki fieldları değiştirmeyi kabul edicez. başka bir fiedl key girildiği zaman hata dönücez..
	const updates = Object.keys(req.body);
	const allowed = ["name", "email", "age", "password"];
	const isValidOperation = updates.every((update) => allowed.includes(update));

	if (!isValidOperation) {
		return res.status(400).send("Invalid updates!");
	}

	try {
		updates.forEach((update) => (req.user[update] = req.body[update]));
		await req.user.save();
		res.send(req.user);
	} catch (error) {
		res.status(400).send(error);
	}
});

// Delete User
router.delete("/me", auth, async (req, res) => {
	try {
		// const user = await User.findByIdAndDelete(req.user._id);
		// if (!user) return res.status(404).send();

		await req.user.remove()
		sendCancelationEmail(req.user.email,req.user.name) // profilini silen kullanıcıya bilgilendirme emaili attık.
		res.send(req.user);
	} catch (error) {
		res.status(500).send(error);
	}
});

// User Profil fotoğrafı ekleme

const upload = multer({
	limits:{
		fileSize:1000000,
	},
	fileFilter(req,file,cb){
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb( new Error('You must be upload .jpg - .jpeg or .png files'))
		}

		cb(null,true)
	}
});
// profil fotoğrafı ekleme route.
router.post('/me/avatar', auth, upload.single('avatar'), async (req,res) =>{

	//sharp package ile fotolarda resize ve extensn değişikliği yaptık..
	const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
	
	req.user.avatar = buffer;
	//req.file.buffer // post metodundan gelen dosya bilgileri burada tutulur..

	await req.user.save()
	res.send()
},(error,req,res,next)=>{
	// burası eğer route handler error verirse çalışacak. kendi özel error handlerımızı kullandık...
	res.status(400).send({error:error.message})
})


// Profil fotoğrafı silme
router.delete('/me/avatar', auth, async (req,res) =>{
	req.user.avatar = undefined
	await req.user.save();
	res.send()
},(error,req,res,next)=>{
	// burası eğer route handler error verirse çalışacak. kendi özel error handlerımızı kullandık...
	res.status(400).send({error:error.message})
})

// profil fotosu görüntüleme
router.get('/:id/avatar', async (req,res) =>{
	try {
		const user = await User.findById(req.params.id)

		if(!user || !user.avatar){
			throw new Error()
		}

		res.set('Content-Type','image/png')

		res.send(user.avatar)
	} catch (error) {
		res.status(404).send()
	}
})

module.exports = router;
