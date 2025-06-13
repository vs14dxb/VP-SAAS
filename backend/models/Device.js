const mongoose = require('mongoose');
const DeviceSchema = new mongoose.Schema({
  name: String,
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
});
module.exports = mongoose.model('Device', DeviceSchema);
