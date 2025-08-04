// routes/appointments.js
const express    = require('express');
const { google } = require('googleapis');
const Appointment = require('../models/Appointment');
const auth       = require('../middleware/auth'); // JWT middleware
const router     = express.Router();

// 1) Service-account JSON parse karo
if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON');
}
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} catch (err) {
  console.error('❌ Invalid GOOGLE_SERVICE_ACCOUNT_JSON:', err);
  throw err;
}

// 2) Private key me escaped "\n" convert karo
const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

// 3) JWT client aur Calendar API setup
const jwtClient = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  privateKey,
  ['https://www.googleapis.com/auth/calendar']
);
const calendar = google.calendar({ version: 'v3', auth: jwtClient });

// 4) Appointment booking endpoint
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, area, disease, datetime } = req.body;
    const dt = new Date(datetime);

    // a) DB me record create karo (patient id auth se)
    const appt = await Appointment.create({
      patient:       req.user.id,
      name,
      phone,
      area,
      disease,
      datetime:      dt,
      status:        'booked'
    });

    // b) Google Calendar me event insert karo
    await jwtClient.authorize();
    const eventRes = await calendar.events.insert({
      calendarId: process.env.CALENDAR_ID,
      resource: {
        summary:     `Appointment: ${name}`,
        description: `Phone: ${phone}\nArea: ${area}\nDisease: ${disease}`,
        start:       { dateTime: dt.toISOString() },
        end:         { dateTime: new Date(dt.getTime() + 30*60000).toISOString() }
      }
    });

    // c) Event ID DB me save karo
    appt.gcal_event_id = eventRes.data.id;
    await appt.save();

    return res.status(201).json(appt);

  } catch (err) {
    console.error('❌ Booking error:', err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
