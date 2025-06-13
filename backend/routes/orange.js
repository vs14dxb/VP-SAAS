// routes/orange.js
const express = require('express');
const router = express.Router();
const { fetchAndStoreOrangeData } = require('../orangeFetcher');

// Manual fetch route (trigger Orange API fetch now)
router.post('/fetch-orange', async (req, res) => {
  await fetchAndStoreOrangeData();
  res.json({ message: "Fetched from Orange and updated database." });
});

module.exports = router;
