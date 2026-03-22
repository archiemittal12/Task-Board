require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Add CORS
const path = require('path'); // Add Path
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const projectRoutes = require('./routes/project.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// --- CRITICAL: Enable CORS for your frontend ---
app.use(
  cors({
    origin: 'http://localhost:5173', // Vite's default frontend port
    credentials: true, // Required if you are using cookies for refresh tokens
  })
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/notifications', notificationRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
