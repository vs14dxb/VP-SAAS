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

module.exports = router;
