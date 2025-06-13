const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');

// GET /api/get-sensor-data?deviceId=xxx&limit=1
router.get('/', async (req, res) => {
  const { deviceId, limit = 1 } = req.query;
  if (!deviceId) return res.status(400).json({ error: "deviceId required" });

  try {
    const docs = await SensorData.find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(Number(limit));
    res.json({ data: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/get-sensor-data/test-insert
router.post('/test-insert', async (req, res) => {
  try {
    const doc = await SensorData.create({
      deviceId: '24E124850F026337',
      temperature: 25,
      humidity: 50,
      tvoc: 100,
      pm1_0: 2,
      pm2_5: 5,
      pm10: 10,
      vaping_index: 0,
      timestamp: new Date(),
      isAlert: false,
    });
    res.json({ doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
