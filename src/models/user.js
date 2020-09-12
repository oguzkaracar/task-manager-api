const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");
require('dotenv').config()

const Schema = mongoose.Schema; // şema objesi oluşturduk.

// user Schema
const userSchema = new Schema(
	{
		// userSchema şemasınının propertylerini tanımladık.
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true,
			validate(val) {
				if (!validator.isEmail(val)) {
					throw new Error("Email is invalid");
				}
			},
		},
		password: {
			type: String,
			required: true,
			minlength: 7,
			trim: true,
			validate(val) {
				if (val.toLowerCase().includes("password")) {
					throw new Error("Password doesn't contain 'password'");
				}
			},
		},
		age: {
			type: Number,
			required: true,
			default: 0,
			// Custom validator oluşturma... mesela yaş olarak negatif sayı giremesinler, bunu kontrol edip, kullanıcıya dönüt verebiliriz.
			validate(value) {
				if (value < 0) {
					throw new Error("Age must be a positive number!");
				}
				// ayrıca kendimiz validate işlemleri için uğraşmak yerine validator paketini kullanabiliriz.!
			},
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
		avatar:{
			type:Buffer // profil fotoğraflarını tutmak için...
		}
	},
	{
		timestamps: true,
	}
);

// virtual documents ==> araştır...

userSchema.virtual("tasks", {
	// database de tutulmayan ama üzerinde işlemler yapabileceğimiz bir field oluşturduk..
	ref: "Task",
	localField: "_id", // burada gönderilecek olan veriler,
	foreignField: "owner", // burada ise diğer model ile olan ilişkiyi sağlayan field belirtilir.
});

// methods model instanceları tarafından kullanılan metodları sağlar.

// sadece public verileri client a göstermek için, password ve tokens fieldları user a gösterilmeyecek...
userSchema.methods.toJSON = function () {
	// toJSON metodu ile model instancelarında yaptığımız değişiklikler, route handlelarda user documentlarını gönderirken de geçerli olucak.
	const user = this;

	const userObject = user.toObject();
	// toObject() metodu mongoose un sağlamış olduğu bir metoddur. ilgili document verisini direkt olarak objeye çevirir.

	// geriye döndüreceğimiz document objesinden user an görmesini istemediğimiz fieldları delete ile sildik.
	delete userObject.password;
	delete userObject.tokens;
	delete userObject.avatar

	return userObject;
};

// singup ve login route handlerda gelen requestlerin tokenlarını oluşturma ve ilgili user documentının tokens fieldına eklenmesi
userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY);

	//user.tokens = user.tokens.concat({token}) 
	user.tokens.push({ token }); // array.push kullanırsam nolur?
	await user.save();
	return token;
};

// staticts Model den erişilen methodları sağlar.
// Login route handler da kullanacağımız userSchema methodu
userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });

	if (!user) {
		throw new Error("Unable to login - user");
	}
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error("Unable to login - password");
	}

	return user;
};

// hashing algoritmaları tek yönlüdür. bir kere hash yaptıktan sonra eski değeri elde edemeyiz..

// password hashing işlemini modele kaydetmeden önce yapıyoruz. gelen plain texti hashed password e çeviricez. normal fonksiyon kullanma nedenimiz this. binding yapmak istediğimiz için. birden fazla yerde bu modeli kullanacağımızı düşünürsek burada password hashing yapmak mantıklıdır..

// bir middleware oluşturduk aslında
userSchema.pre("save", async function (next) {
	// pre metodu ile şema içindeki fieldları manipule edebiliriz. Burada database e kaydedilmeden önce gelen user password'ü hashleme işlemi yaptık.
	const user = this;
	if (user.isModified("password")) {
		// bu şekilde yapınca hem yeni user ekleme de hem de user update ederken password hashing yaparız..
		user.password = await bcrypt.hash(user.password, 8);
	}
	next(); // fonskiyon bitti middleware i kapat ve diğer middleware e geç dedik.
});

// User silinince user'a ait olan taskler de silinsin...
userSchema.pre("remove", async function (next) {
	const user = this;

	await Task.deleteMany({ owner: user._id });
	// Task modelini import ettikten sonra, user silinmeden hemen önce o usera ait olan bütün taskleri de silecek...

	next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;

// jwt ile kullanıcı yetkilendirmesi ve kimliklendirmesi yapabiliriz. JWT ile Authorization işlemine bakacağız. Burada Authentication ile karıştırılmamalı. Authentication, kimlik doğrulamadır. Authorization ise sisteme giriş için yetki kontrolüdür. Authentication birkez yapıldıktan sonra, atılan her istekte bir authorization işlemi yapılır. Tabi bu durum geliştirdiğiniz uygulamaya göre değişebilir.

// KAYNAK:: => https://www.youtube.com/watch?v=mbsmsi7l3r4 -- İZLE
// KAYNAK :: => https://medium.com/@tugrulbayrak/jwt-json-web-tokens-nedir-nasil-calisir-5ca6ebc1584a -- OKU.

// const jwt = require('jsonwebtoken')

// const myFunction = async () =>{
// 	const token = jwt.sign({_id:'deneme1'}, 'thisismynewcourse',{expiresIn:'7 days'})
// 	const data = jwt.verify(token,'thisismynewcourse')
// 	console.log(token)
// 	console.log(data)
// }
// // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJhc2RzczIiLCJpYXQiOjE1OTk3NTE0OTN9.Q2517AWljLy58buhJLqw3iPzh4qQ4NlE9z33wDQ-lO0 -- token 3 parçadan oluşur. 1. noktaya kadar olan kısım header kısmıdır JWT’de kullanılacak bu kısım JSON formatında yazılmakta ve 2 alandan oluşmaktadır. kullanılan algoritma ve type kısmı. 2ç kısım datayı tutar base64 le encode edilmiştir. 3. kısım ise signature dır. token ı verify ederken lazım olacaktır.

// myFunction()
