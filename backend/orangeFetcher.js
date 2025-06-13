// backend/orangeFetcher.js

const cron = require('node-cron');
const fetch = require('node-fetch'); // Use node-fetch@2
const SensorData = require('./models/SensorData');

const ORANGE_API_URL = 'https://liveobjects.orange-business.com/api/v1/data/search';
const ORANGE_API_KEY = '9e3d1eebdadb42709de8c56f42a16e5e';

// Map devEUI to deviceId (uppercase)
const DEV_EUI_TO_DEVICE_ID = {
  "24e124850f026337": "24E124850F026337", // GS601-1
  "24e124850f026622": "24E124850F026622"  // GS601-2
};

const DEVICES = [
  { name: "GS601-1", id: "24E124850F026337" },
  { name: "GS601-2", id: "24E124850F026622" },
];

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

// Main fetch function
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
        size: 10 // Increase to make sure you get both devices
      })
    });
    const data = await res.json();

    const hits = data.hits?.hits || [];
    const seenDevices = new Set();

    for (const h of hits) {
      const value = h._source.value;
      value.timestamp = new Date(h._source.timestamp);

      // --- Device ID Fix ---
      // Try to get deviceId from devEUI mapping if deviceId missing
      let deviceIdCandidate =
        h._source.deviceId ||
        value.deviceId ||
        h._source.identifier ||
        h._source.devEUI ||
        value.devEUI ||
        "unknown";

      // Map lower-case devEUI/deviceId to your known deviceId
      const mappedDeviceId = DEV_EUI_TO_DEVICE_ID[deviceIdCandidate.toLowerCase()];
      value.deviceId = mappedDeviceId || deviceIdCandidate;

      if (DEVICES.some(d => d.id === value.deviceId)) {
        seenDevices.add(value.deviceId);
      }

      // Debug log
      console.log('Fetched Orange data:', value);

      // Check for alert and insert
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

    // Log missing devices
    for (const device of DEVICES) {
      if (!seenDevices.has(device.id)) {
        console.warn(`Warning: No data from Orange for device ${device.name} (${device.id}) in this fetch.`);
        // Optionally insert a "missing data" record (commented)
        // await SensorData.create({
        //   deviceId: device.id,
        //   timestamp: new Date(),
        //   isAlert: false,
        //   missing: true,
        // });
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
