const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

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
    app.get("/tasks", async (req, res) => {
      const query = {};
      const tasks = await taskCollection.find(query).toArray();
      res.send(tasks);
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
