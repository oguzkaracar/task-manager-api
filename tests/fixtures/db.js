const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

require("dotenv").config();
// supertest modülü express applerde test yapmamızı kolaylaştırıyor. jest kullanarak supertest ile api testleri yapıcaz.

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
	_id: userOneId,
	name: "Oguzhan",
	email: "ozzykara@ozzykara.com",
	password: "oguz123",
	tokens: [
		{
			token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET_KEY),
		},
	],
};


const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
	_id: userTwoId,
	name: "Ahmet",
	email: "ahmet@ahmet.com",
	password: "ahmet123",
	tokens: [
		{
			token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET_KEY),
		},
	],
};

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'first tasks',
    completed: false,
    owner:userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'second tasks',
    completed: true,
    owner:userOne._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'third tasks',
    completed: false,
    owner:userTwo._id
}


const setupDatabase = async ()=>{
    await User.deleteMany(); // her yeni testte user collectionunu silecek.
    await Task.deleteMany();
	await new User(userOne).save(); // database e ekledik.
    await new User(userTwo).save(); // database e ekledik.
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports ={
    userOneId,
    userOne,
    userTwo,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase,
   
}