const express = require('express');
const SensorData = require('../models/SensorData');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const data = await SensorData.find({ organizationId: req.organizationId }).limit(100).sort('-createdAt');
  res.json(data);
});

router.post('/', auth, async (req, res) => {
  const { deviceId, temperature, humidity } = req.body;
  const entry = new SensorData({ deviceId, temperature, humidity, organizationId: req.organizationId });
  await entry.save();
  res.json(entry);
});

module.exports = router;
