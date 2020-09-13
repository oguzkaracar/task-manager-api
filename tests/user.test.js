const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const {userOneId, userOne, setupDatabase} = require('./fixtures/db') // db bilgilerini başka dosyadan alıcaz.


beforeEach(setupDatabase);

// afterEach(() => {
// 	// her test senaryosundan sonra neler yapılacağını belirtmek için kullanırız.
// 	console.log("afterEach");
// });

// *** signup user test case
test("Should signup new user", async () => {
	const response = await request(app)
		.post("/users")
		.send({
			name: "Osman",
			email: "osman@xyzosman.com",
			password: "osman123",
		})
        .expect(201);
        
        // Assert that the database was changed correctly
        const user = await User.findById(response.body.user._id)
        expect(user).not.toBeNull()

        // Assertions about the response (object assertion) gelen response body ye göre objeleri de test edebiliriz.
        expect(response.body).toMatchObject({
            user:{
                name:'Osman',
                email:'osman@xyzosman.com'
            },
            token: user.tokens[0].token
           
        })
        expect(user.password).not.toBe('osman123')

});

// * login user test case.
test("should login existing user", async () => {
	const response = await request(app)
		.post("/users/login")
		.send({
			email: userOne.email,
			password: userOne.password,
		})
        .expect(200);
        
        // fetching user
        const user = await User.findById(response.body.user._id)
        expect(response.body.token).toBe(user.tokens[1].token)

        // second token

});

// profili görüntüleme test case.
test("Should get profile for user", async () => {
	await request(app).get("/users/me").set("Authorization", `Bearer ${userOne.tokens[0].token}`).send().expect(200);
});

// profili görüntüleme hatalı test case.
test("Should not get profile for unauthorized user", async () => {
	await request(app)
		.get("/users/me")
		// .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(401);
});

// authentication a sahip kullanıcıyı silebilecek.
test("Should delete account for user", async () => {
    await request(app).delete("/users/me").set("Authorization", `Bearer ${userOne.tokens[0].token}`).send().expect(200);
     
     // validating user is removed

     const user = await User.findById(userOneId)
     expect(user).toBeNull()
});


// authentication a sahip kullanıcıyı silebilecek.
test("Should not delete account for unauthenticated user", async () => {
	await request(app).delete("/users/me").send().expect(401);
});

// Profil fotoğrafı ekleme test case

test('Should upload avatar image', async ()=>{
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)

        const user = await User.findById(userOneId)
        expect(user.avatar).toEqual(expect.any(Buffer)) // objeleri kontrol ederken toEqual kullanılır.
})

// user update test case 

test('Should update valid user fields', async ()=>{
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name:'Jess'
        })
        .expect(200)

        const user = await User.findById(userOneId)
        expect(user.name).toEqual('Jess')
})

// user update invalid fields test case 
test('Should not update invalid user fields', async ()=>{
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location:'Ankara'
        })
        .expect(400)
})

// ** jest, mocha vb. js test araçları ve teknikleri ile ilgili daha detaylı araştırma ve çalışmalar yapılacak!!!