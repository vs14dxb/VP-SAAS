const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Organization = require('../models/Organization');
const User = require('../models/User');

const router = express.Router();

// Register & create org
router.post('/signup', async (req, res) => {
  const { email, password, orgName } = req.body;
  try {
    const org = new Organization({ name: orgName });
    await org.save();
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hash, organizationId: org._id });
    await user.save();
    res.json({ message: 'Signup successful.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid email or password' });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

module.exports = router;
