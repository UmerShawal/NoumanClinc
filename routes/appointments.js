const express    = require('express');
const { google } = require('googleapis');
const Appointment = require('../models/Appointment');
const router     = express.Router();

if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable');
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} catch (err) {
  console.error('❌ Invalid GOOGLE_SERVICE_ACCOUNT_JSON:', err);
  throw err;
}

const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

const jwtClient = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  privateKey,
  ['https://www.googleapis.com/auth/calendar']
);

const calendar = google.calendar({ version: 'v3', auth: jwtClient });

router.post('/', async (req, res) => {
  try {
    const { name, phone, area, disease, datetime } = req.body;

    const appt = await Appointment.create({
      name, phone, area, disease, datetime, status: 'booked'
    });

    await jwtClient.authorize();
    await calendar.events.insert({
      calendarId: process.env.CALENDAR_ID,
      resource: {
        summary:   `Appointment: ${name}`,
        description: `Phone: ${phone}\nArea: ${area}\nDisease: ${disease}`,
        start:     { dateTime: datetime },
        end:       { dateTime: new Date(new Date(datetime).getTime() + 30 * 60000).toISOString() },
      }
    });

    res.status(201).json(appt);

  } catch (err) {
    console.error('❌ Booking error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
