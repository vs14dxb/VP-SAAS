// backend/app.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  // useNewUrlParser and useUnifiedTopology are optional in latest mongoose
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Register models
require('./models/SensorData');

// Run the Orange fetcher (cron job)
require('./orangeFetcher');

// --- ROUTES ---

// Health check
app.get('/', (req, res) => {
  res.send('VP-SAAS backend is running!');
});

// Sensor data routes (latest, alerts, etc.)
const sensorDataRoutes = require('./routes/sensordata');
app.use('/api/sensordata', sensorDataRoutes);

// Manual Orange fetch
const orangeRoutes = require('./routes/orange');
app.use('/api/orange', orangeRoutes);

// GET sensor data by deviceId and limit (for dashboard cards)
const getSensorDataRoutes = require('./routes/get-sensor-data');
app.use('/api/get-sensor-data', getSensorDataRoutes);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
