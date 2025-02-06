const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTasksByStatus
} = require('../controllers/taskController');

const router = express.Router();

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.route('/status/:status')
  .get(protect, getTasksByStatus);

module.exports = router;
