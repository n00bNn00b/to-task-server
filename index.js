const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * MongoDB config
 */

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.cluxn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {
  try {
    await client.connect();
    console.log("DB Connected!");
    const taskCollection = client.db("todo").collection("tasks");
    const completedTaskCollection = client
      .db("todo")
      .collection("completedTasks");

    //   REST API
    // all tasks
    app.get("/tasks", async (req, res) => {
      try {
        const query = {};
        const tasks = await taskCollection.find(query).toArray();
        res.send(tasks);
        // console.log(tasks);
      } catch (err) {
        res.send(err);
      }
    });

    // completed task by email
    app.get("/tasks/:email/completed", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email };
        const tasks = await completedTaskCollection.find(query).toArray();
        res.send(tasks);
      } catch (err) {
        res.send(err);
      }
    });
    // task by id
    app.get("/task/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const task = await taskCollection.findOne(query);
        res.send(task);
      } catch (err) {
        res.send(err);
      }
    });
    // single task filter by email
    app.get("/tasks/:email/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const task = await taskCollection.findOne(query);
        res.send(task);
      } catch (err) {
        res.send(err);
      }
    });

    // tasks by individual user
    app.get("/tasks/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const filter = { email: email };
        const cursor = taskCollection.find(filter);
        const tasks = await cursor.toArray();
        res.send(tasks);
      } catch (err) {
        res.send(err);
      }
    });

    // post request by user
    app.post("/tasks", async (req, res) => {
      try {
        const task = req.body;
        const query = {
          email: task.email,
          taskName: task.taskName,
          status: task.status,
        };
        const exists = await taskCollection.findOne(query);
        if (exists) {
          return res.send({ success: false, task: exists });
        }
        const result = await taskCollection.insertOne(query);
        return res.send({ success: true, result });
      } catch (err) {
        res.send(err);
      }
    });
    // completed tasks post
    app.post("/completed", async (req, res) => {
      try {
        const task = req.body;
        const query = {
          email: task.email,
          taskName: task.taskName,
          status: task.status,
        };
        const exists = await completedTaskCollection.findOne(query);
        if (exists) {
          return res.send({
            success: false,
            task: exists,
          });
        }
        const result = await completedTaskCollection.insertOne(query);
        res.send({
          success: true,
          result,
        });
      } catch (err) {
        res.send(err);
      }
    });

    // delete item
    app.delete("/tasks/:email/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const email = req.params.email;
        console.log(id, email);
        const query = { _id: ObjectId(id), email: email };
        const removedTask = await taskCollection.deleteOne(query);
        res.send(removedTask);
        console.log(removedTask);
      } catch (err) {
        res.send(err);
      }
    });
  } finally {
    //
  }
};

run().catch(console.dir);

// root api
app.get("/", (req, res) => {
  res.send("Server is Running! 😎");
});

app.listen(port, () => {
  console.log("Listening to the port: ", port);
});
