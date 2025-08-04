// routes/auth.js

const express  = require('express');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const router   = express.Router();

// ——— Helper to log DB state ———
function logDbState(tag) {
  console.log(`🔍 [${tag}] mongoose.connection.readyState =`, mongoose.connection.readyState);
}

// ——— Registration ———
router.post('/register', async (req, res) => {
  logDbState('REGISTER');
  const { name, email, password } = req.body;
  console.log('✉️ [REGISTER] payload:', { name, email });

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      console.warn('⚠️ [REGISTER] Email already registered:', email);
      return res.status(400).json({ message: 'Email pehle se register hai' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash });
    await user.save();
    console.log('✅ [REGISTER] User created:', email);
    return res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('❌ [REGISTER] error:', err);
    return res.status(500).json({ message: err.message });
  }
});

// ——— Login ———
router.post('/login', async (req, res) => {
  logDbState('LOGIN');
  const { email, password } = req.body;
  console.log('✉️ [LOGIN] payload:', { email });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('⚠️ [LOGIN] User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.warn('🔒 [LOGIN] Incorrect password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    console.log('🔐 [LOGIN] Token generated for:', email);
    return res.json({ token });
  } catch (err) {
    console.error('❌ [LOGIN] error:', err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
