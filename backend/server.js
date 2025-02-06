const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');
const { protect } = require('./middleware/auth');
const socketIO = require('socket.io');
const http = require('http');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'],
  },
});

const cron = require('node-cron');
const { updateTaskStatus } = require('./controllers/taskController');

cron.schedule('0 * * * *', () => {
  console.log('Running task status update...');
  updateTaskStatus(io);
});

// Attach io to app
app.set('io', io);

// Middleware
app.use(cors());

// Routes
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/auth/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

server.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});
