// nouman-clinic/index.js

require('dotenv').config();
const express      = require('express');
const serverless   = require('serverless-http');
const mongoose     = require('mongoose');
const bcrypt       = require('bcryptjs');
const User         = require('./models/User');
const authRoutes        = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');

const app  = express();
const PORT = process.env.PORT || 3000;

// ——— Manual CORS middleware —————————————————————
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [
    process.env.FRONTEND_URL,     
    process.env.DEV_FRONTEND_URL, 
    process.env.DEV_FRONTEND_URL2 
  ].filter(Boolean);
  if (!origin || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
  }
  next();
});
// ——————————————————————————————————————————————————

app.use(express.json());

// ——— Lazy MongoDB connect + admin seed —————————————————
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  });
  console.log('✅ MongoDB connected');
  isConnected = true;

  // admin seed
  const { ADMIN_EMAIL: email, ADMIN_PASS: pass, ADMIN_NAME: name = 'Admin' } = process.env;
  if (email && pass) {
    const exists = await User.findOne({ email });
    if (!exists) {
      const hash = await bcrypt.hash(pass, 10);
      await User.create({ name, email, password: hash, role: 'admin' });
      console.log('🚀 Admin created:', email);
    }
  }
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ DB connection error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});
// ————————————————————————————————————————————————————

app.get('/ping', (req, res) => res.json({ pong: true }));
app.use('/auth', authRoutes);
app.use('/appointments', appointmentRoutes);
app.get('/', (req, res) => res.send('Nouman Clinic API running'));

// local dev vs serverless export
if (process.env.NODE_ENV === 'development') {
  app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
} else {
  module.exports = serverless(app);
}
