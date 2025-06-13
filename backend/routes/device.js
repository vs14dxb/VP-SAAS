const express = require('express');
const Device = require('../models/Device');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const devices = await Device.find({ organizationId: req.organizationId });
  res.json(devices);
});

router.post('/', auth, async (req, res) => {
  const { name } = req.body;
  const device = new Device({ name, organizationId: req.organizationId });
  await device.save();
  res.json(device);
});

module.exports = router;
