const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find();
  res.status(200).json(tasks);
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const task = await Task.create({
    user: req.user.id,
    title,
    description
  });

  res.status(201).json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check for user
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedTask);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check for user
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await task.remove();

  res.status(200).json({ id: req.params.id });
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
