require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');
const authRoutes        = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');

async function main() {
  console.log('🔑 FRONTEND_URL     =', process.env.FRONTEND_URL);
  console.log('🔑 DEV_FRONTEND_URL =', process.env.DEV_FRONTEND_URL);
  console.log('🔑 DEV_FRONTEND_URL2=', process.env.DEV_FRONTEND_URL2);
  console.log('🔑 MONGO_URI        =', process.env.MONGO_URI);

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  });
  console.log('✅ MongoDB connected');

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

  const app  = express();
  const PORT = process.env.PORT || 3000;

  const allowedOrigins = [
    process.env.FRONTEND_URL,    
    process.env.DEV_FRONTEND_URL, 
    process.env.DEV_FRONTEND_URL2 
  ].filter(Boolean);

  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn('Blocked CORS from', origin);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); 

  app.use(express.json());

  app.get('/ping', (req, res) => res.json({ pong: true }));

  app.use('/auth', authRoutes);
  app.use('/appointments', appointmentRoutes);

  app.get('/', (req, res) => res.send('Nouman Clinic API running'));

  app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
}

main().catch(err => {
  console.error('❌ Startup error:', err);
  process.exit(1);
});
