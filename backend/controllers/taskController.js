const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user.id });
  res.status(200).json(tasks);
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const task = await Task.create({
    user: req.user.id,
    title,
    description,
    dueDate,
    status: 'in progress' // Set default status to "in progress"
  });

  req.app.get('io').emit('taskCreated', task); // Emit task created event

  res.status(201).json(task);
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
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

  req.app.get('io').emit('taskUpdated', updatedTask);
   // Emit task updated event

  res.status(200).json(updatedTask);
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
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

  await Task.deleteOne({ _id: req.params.id });

  req.app.get('io').emit('taskDeleted', req.params.id); // Emit task deleted event

  res.status(200).json({ id: req.params.id });
});

// @desc    Get tasks by status
// @route   GET /api/tasks/status/:status
// @access  Private
const getTasksByStatus = asyncHandler(async (req, res) => {
  let status = req.params.status;
  const tasks = (status === 'all' || !status) ? await Task.find({ user: req.user.id }) : await Task.find({ user: req.user.id, status: status });
  res.status(200).json(tasks);
});

const moment = require('moment-timezone');

const updateTaskStatus = asyncHandler(async (io) => {
  const now = moment.tz('Asia/Kolkata').toISOString();
  const overdueTasks = await Task.find({
    dueDate: { $lt: now },
    status: { $ne: 'completed' }
  });

  for (const task of overdueTasks) {
    task.status = 'pending';
    await task.save();
    io.emit('taskUpdated', { task, user: task.user });
  }
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTasksByStatus,
  updateTaskStatus
};
