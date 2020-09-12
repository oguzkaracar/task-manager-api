const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = express.Router();

// **** --------------- Task Routes ----------------

// task ekle.
router.post("/", auth, async (req, res) => {
	// const task = new Task(req.body);
	const task = new Task({
		...req.body, // spread operator kullandık.
		owner: req.user._id,
		// auth dan gelen req.user dan id yi alarak task i üreten kullanıcının id sini almış olduk. sonraki işlemler de bu id i kullanarak işlemler yapıcaz.
	});
	try {
		await task.save();
		res.status(201).send(task);
	} catch (error) {
		res.status(400).send(error);
	}
});
// GET /tasks?completed=true -- tamamlanmış ya da tamamlanmamış taskleri göster.
// GET /tasks?limit&skip=0 -- kaç tane task aynı anda görmek istiyorsun.
// GET /tasks?sortBy=createdAt_desc 
// tasklerin hepsini getir...
router.get("/", auth, async (req, res) => {
	const match = {};
	const sort = {};
	// query string olarak herhangi birşey girilebilir bu yüzden stringleri boolean a çevirmek lazım.
	if(req.query.completed){
		match.completed = req.query.completed === 'true' // true ise match.completed true olucak, diğer durumlarda false olucak.
	}

	if(req.query.sortBy){ // sorting - query string 
		const parts = req.query.sortBy.split(':');
		sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
	}

	console.log(match)
	try {
		//const tasks = await Task.find({ owner: req.user._id }); // authentication a göre sadece kendi tasklerini görecek..
		const tasks = await req.user.populate({
			path: 'tasks',
			match,
			options:{ // mongoose tarafından sağlanan optionslar.
				limit: Number(req.query.limit), // parseInt metodu da kullanabilirim.
				skip:Number(req.query.skip),
				sort
			},
			
		}).execPopulate() // bir diğer yöntem...

		res.send(tasks.tasks);
	} catch (error) {
		res.status(500).send(error);
	}
});

// id sine göre 1 tane task getir.
router.get("/:id", auth, async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findOne({ _id, owner: req.user._id });
		// hem kullanıcı tarafından getirilen task id sini hem de auth dan gelen owner id'ye sahip olan task i getir dedik. Eğer id si verilen task owner id ye eşit değilse gösterilmeyecek..
		if (!task) {
			return res.status(404).send();
		}
		res.send(task);
	} catch (error) {
		res.status(500).send(error);
	}
});
// taskleri güncelle.
router.patch("/:id", auth, async (req, res) => {
	// sadece istenilen fieldlarda update işlemi yapılsın..
	const updates = Object.keys(req.body);
	const allowed = ["description", "completed"];
	const isValidOperation = updates.every((update) => allowed.includes(update));

	if (!isValidOperation) {
		return res.status(400).send();
	}

	try {
		// yazılımsal olarak data eklerken ya da fieldları manipüle etmek istersek bu şekilde dinamik bir yapı oluştururuz..
		const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
		updates.forEach((update) => (task[update] = req.body[update]));
		await task.save();

		//const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		if (!task) {
			return res.status(404).send();
		}
		res.send(task);
	} catch (error) {
		res.status(400).send(error);
	}
});

// delete task

router.delete("/:id", auth, async (req, res) => {
	try {
		const task = await Task.findOneAndDelete({_id:req.params.id, owner: req.user._id});
		if (!task) return res.status(404).send();
		res.send(task);
	} catch (error) {
		res.status(500).send(error);
	}
});

module.exports = router;
