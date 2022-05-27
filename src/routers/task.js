const express = require("express");
const Task = require("../models/task");
const router = new express.Router();
const bodyParser = require("body-parser");
const auth = require("../middleware/auth");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
router.post("/users/task", urlencodedParser, auth, async (req, res) => {
  const task = new Task({
    description: req.body.description,
    completed: req.body.completed,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.render("taskcreated", {
      holder: "IN",
      name: req.user.name,
      email: req.user.email,
      age: req.user.age,
      description: task["description"],
      completed: task["completed"],
    });
  } catch (e) {
    res.render("error", {
      title: "about",
      country: "USA",
      holder: "IN",
      errorMessage: "Task description cannot be empty",
    });
  }
});

router.get("/users/tasks", urlencodedParser, auth, async (req, res) => {
  try {
    await req.user.populate("tasks").execPopulate();
    req.user.tasks = req.user.tasks.filter((e) => {
      return e.completed === false;
    });
    res.render("tasks", {
      holder: "IN",
      name: req.user.name,
      arr: req.user.tasks,
    });
  } catch (e) {
    res.render("404", {
      holder: "IN",
      errorMessage: "Please login again",
    });
  }
});

router.post("/users/updatetasks", urlencodedParser, auth, async (req, res) => {
  try {
    const taskIds = Object.keys(req.body);

    taskIds.forEach(async (taskId) => {
      let task = await Task.findOne({
        _id: taskId,
        owner: req.user._id,
      });
      task.completed = true;
      await task.save();
    });
    res.redirect("/users/tasks?");
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
