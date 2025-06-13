const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  temperature: Number,
  humidity: Number,
  tvoc: Number,
  pm1_0: Number,
  pm2_5: Number,
  pm10: Number,
  vaping_index: Number,
  timestamp: Date,
  isAlert: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SensorData', SensorDataSchema);
