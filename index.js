// index.js

require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');
const authRoutes        = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');

async function main() {
  // 0) Env vars check
  console.log('🔑 FRONTEND_URL     =', process.env.FRONTEND_URL);
  console.log('🔑 DEV_FRONTEND_URL =', process.env.DEV_FRONTEND_URL);
  console.log('🔑 DEV_FRONTEND_URL2=', process.env.DEV_FRONTEND_URL2);
  console.log('🔑 MONGO_URI        =', process.env.MONGO_URI);

  // 1) MongoDB connect
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  });
  console.log('✅ MongoDB connected');

  // 2) Seed Admin user
  const { ADMIN_EMAIL: email, ADMIN_PASS: pass, ADMIN_NAME: name = 'Admin' } = process.env;
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
  const app  = express();
  const PORT = process.env.PORT || 3000;

  // 4) Manual CORS middleware (sab se pehle)
  app.use((req, res, next) => {
    // Agar aap chahein to origin filter laga sakte hain,
    // magar testing ke liye sab allow karna asaan hai:
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type,Authorization'
    );
    if (req.method === 'OPTIONS') {
      // Preflight request ka 200 se jawab
      return res.sendStatus(200);
    }
    next();
  });

  // 5) JSON body parser
  app.use(express.json());

  // 6) Health-check
  app.get('/ping', (req, res) => res.json({ pong: true }));

  // 7) Mount routes
  app.use('/auth', authRoutes);
  app.use('/appointments', appointmentRoutes);

  // 8) Root endpoint
  app.get('/', (req, res) => res.send('Nouman Clinic API running'));

  // 9) Start server
  app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
}

main().catch(err => {
  console.error('❌ Startup error:', err);
  process.exit(1);
});
