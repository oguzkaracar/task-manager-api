const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/task");
const { userOneId, userOne, setupDatabase, taskOne,taskThree,taskTwo,userTwo,userTwoId } = require("./fixtures/db");

beforeEach(setupDatabase);


// Create task test case:
test("Should create task for user", async () => {
	const response = await request(app)
		.post("/tasks")
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.send({
			description: "From my test",
		})
		.expect(201);

	const task = await Task.findById(response.body._id);
	expect(task).not.toBeNull();
	expect(task.completed).toEqual(false);
});


// user one tasks

test('Should fetch user tasks', async ()=>{
        const response = await request(app).get('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
        expect(response.body.length).toEqual(2)

})


// Yetkisiz task silme test case:

test('Should not delete other users stasks', async () =>{
    const response = await request(app).delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})


// https://gist.github.com/andrewjmead/988d5965c609a641202600b073e54266  --ekstra test fikirleri belki bir ara bakarız..
