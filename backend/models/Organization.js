const mongoose = require('mongoose');
const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});
module.exports = mongoose.model('Organization', OrganizationSchema);
