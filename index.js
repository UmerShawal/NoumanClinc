require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');
const cors       = require('cors');
const User       = require('./models/User');
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');

const app = express();

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });
  console.log('✅ MongoDB connected');
  isConnected = true;

  const { ADMIN_EMAIL: email, ADMIN_PASS: pass, ADMIN_NAME: name = 'Admin' } = process.env;
  if (email && pass) {
    const existing = await User.findOne({ email });
    if (!existing) {
      const hash = await bcrypt.hash(pass, 10);
      await User.create({ name, email, password: hash, role: 'admin' });
      console.log('🚀 Admin user created:', email);
    } else {
      console.log('✅ Admin already exists:', email);
    }
  }
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ DB connect error:', err);
    res.status(500).json({ message: 'Database connection error' });
  }
});

const allowedOrigins = [
  process.env.FRONTEND_URL,     
  process.env.DEV_FRONTEND_URL,  
  process.env.DEV_FRONTEND_URL2, 
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS not allowed: ${origin}`));
  },
  credentials: true
}));

app.use(express.json());
app.get('/ping', (req, res) => res.json({ pong: true }));

app.use('/auth', authRoutes);
app.use('/appointments', appointmentRoutes);
app.get('/', (req, res) => res.send('Nouman Clinic API running'));

module.exports = app;
