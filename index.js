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
    const taskCollection = client.db("test").collection("tasks");

    //   REST API
    // all tasks
    app.get("/tasks", async (req, res) => {
      const query = {};
      const tasks = await taskCollection.find(query).toArray();
      res.send(tasks);
      // console.log(tasks);
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
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const task = await taskCollection.findOne(query);
      res.send(task);
    });

    // tasks by individual user
    app.get("/tasks/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const cursor = taskCollection.find(filter);
      const tasks = await cursor.toArray();
      res.send(tasks);
    });

    // post request by user
    app.post("/tasks", async (req, res) => {
      const taskName = req.body;
      const query = {
        email: taskName.email,
        task: taskName.taskName,
      };
      const exists = await taskCollection.findOne(query);
      if (exists) {
        return res.send({ success: false, tasks: exists });
      }
      const result = await taskCollection.insertOne(taskName);
      return res.send({ success: true, result });
    });

    // delete item
    app.delete("/tasks/:email/:id", async (req, res) => {
      const id = req.params.id;
      const email = req.params.email;
      console.log(id, email);
      const query = { _id: ObjectId(id), email: email };
      const removedTask = await taskCollection.deleteOne(query);
      res.send(removedTask);
      console.log(removedTask);
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
