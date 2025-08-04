require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');
const authRoutes        = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');

async function main() {
  // 0) Env check
  console.log('🔑 FRONTEND_URL     =', process.env.FRONTEND_URL);
  console.log('🔑 DEV_FRONTEND_URL =', process.env.DEV_FRONTEND_URL);
  console.log('🔑 DEV_FRONTEND_URL2=', process.env.DEV_FRONTEND_URL2);
  console.log('🔑 MONGO_URI        =', process.env.MONGO_URI);

  // 1) Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  });
  console.log('✅ MongoDB connected');

  // 2) Seed Admin
  const { ADMIN_EMAIL: email, ADMIN_PASS: pass, ADMIN_NAME: name='Admin' } = process.env;
  if (email && pass) {
    let admin = await User.findOne({ email });
    if (!admin) {
      const hash = await bcrypt.hash(pass, 10);
      await User.create({ name, email, password: hash, role: 'admin' });
      console.log('🚀 Admin created:', email);
    } else {
      console.log('✅ Admin exists:', email);
    }
  } else {
    console.warn('⚠️ ADMIN_EMAIL/PASS missing—skipping seed');
  }

  // 3) Express setup
  const app = express();
  const PORT = process.env.PORT || 3000;

  // 4) CORS setup
  const allowedOrigins = [
    process.env.FRONTEND_URL,      // https://nouman-clinc.vercel.app
    process.env.DEV_FRONTEND_URL,  // http://localhost:3000
    process.env.DEV_FRONTEND_URL2  // http://localhost:3001
  ].filter(Boolean);

  app.use(cors({
    origin: allowedOrigins,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 204
  }));
  // for explicit preflight on all routes
  app.options('*', cors());

  // 5) JSON parser
  app.use(express.json());

  // 6) Health-check
  app.get('/ping', (req, res) => res.json({ pong: true }));

  // 7) Mount routes
  app.use('/auth', authRoutes);
  app.use('/appointments', appointmentRoutes);

  // 8) Root
  app.get('/', (req, res) => res.send('Nouman Clinic API running'));

  // 9) Start server
  app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
}

main().catch(err => {
  console.error('❌ Startup error:', err);
  process.exit(1);
});
