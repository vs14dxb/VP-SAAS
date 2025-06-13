// backend/orangeFetcher.js

const cron = require('node-cron');
const fetch = require('node-fetch'); // Make sure node-fetch@2 is installed
const SensorData = require('./models/SensorData');

const ORANGE_API_URL = 'https://liveobjects.orange-business.com/api/v1/data/search';
const ORANGE_API_KEY = '9e3d1eebdadb42709de8c56f42a16e5e';

// Customize these as needed
const ALERT_THRESHOLDS = {
  tvoc: 300,
  pm10: 50,
  vaping_index: 4,
};

function isAlert(data) {
  return (
    (data.tvoc && data.tvoc > ALERT_THRESHOLDS.tvoc) ||
    (data.pm10 && data.pm10 > ALERT_THRESHOLDS.pm10) ||
    (data.vaping_index && data.vaping_index > ALERT_THRESHOLDS.vaping_index)
  );
}

// This function can be triggered by cron or manually via route
async function fetchAndStoreOrangeData() {
  try {
    const res = await fetch(ORANGE_API_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': ORANGE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sort: { timestamp: { order: 'desc' } },
        size: 3
      })
    });
    const data = await res.json();

    const hits = data.hits?.hits || [];
    for (const h of hits) {
      const value = h._source.value;
      value.timestamp = new Date(h._source.timestamp);
      // Sometimes Orange data structure varies, ensure deviceId
      value.deviceId = h._source.deviceId || value.deviceId || h._source.identifier || "unknown";

      // Log for debugging
      console.log('Fetched Orange data:', value);

      // Check for alert
      if (isAlert(value)) {
        await SensorData.create({ ...value, isAlert: true });
        console.log("ALERT: Saved sensor data", value);
      } else {
        // Save only if not already saved for this timestamp/device
        const exists = await SensorData.findOne({ timestamp: value.timestamp, deviceId: value.deviceId });
        if (!exists) {
          await SensorData.create({ ...value, isAlert: false });
          console.log("Saved hourly data", value);
        }
      }
    }
  } catch (err) {
    console.error("Orange fetch error:", err);
  }
}

// SCHEDULED TASK: Every hour (for demo/testing, change to '*/1 * * * *' for every minute)
cron.schedule('0 * * * *', async () => {
  await fetchAndStoreOrangeData();
});

module.exports = { fetchAndStoreOrangeData };
