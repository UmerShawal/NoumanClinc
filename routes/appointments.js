// routes/appointments.js
const express     = require('express');
const { google }  = require('googleapis');
const Appointment = require('../models/Appointment');
const auth        = require('../middleware/auth');
const router      = express.Router();

// 1) Service-account JSON parse karo
if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON');
}
let sa;
try {
  sa = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} catch (err) {
  console.error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON:', err);
  throw err;
}

// 2) Private key me newline restore karo
const privateKey = sa.private_key.replace(/\\n/g, '\n');

// 3) JWT client + Calendar API
const jwtClient = new google.auth.JWT(
  sa.client_email,
  null,
  privateKey,
  ['https://www.googleapis.com/auth/calendar']
);
const calendar = google.calendar({ version: 'v3', auth: jwtClient });

// 4) Booking endpoint (auth lagaao)
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, area, disease, datetime } = req.body;
    const dt = new Date(datetime);

    // a) DB me save karo (patient from req.user.id)
    const appt = await Appointment.create({
      patient:       req.user.id,
      name,
      phone,
      area,
      disease,
      datetime:      dt,
      status:        'booked'
    });

    // b) Google Calendar me event insert
    await jwtClient.authorize();
    const ev = await calendar.events.insert({
      calendarId: process.env.CALENDAR_ID,
      resource: {
        summary:     `Appointment: ${name}`,
        description: `Phone: ${phone}\nArea: ${area}\nDisease: ${disease}`,
        start:       { dateTime: dt.toISOString() },
        end:         { dateTime: new Date(dt.getTime() + 30*60000).toISOString() }
      }
    });

    // c) Save event ID
    appt.gcal_event_id = ev.data.id;
    await appt.save();

    res.status(201).json(appt);
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
