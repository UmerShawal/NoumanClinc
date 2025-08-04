// utils/googleCalendar.js
const { google } = require('googleapis');
const path = require('path');

// Auth client setup: service-account.json ko load karega
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../service-account.json'),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

// Calendar API client
const calendar = google.calendar({ version: 'v3', auth });

/**
 * Calendar par naya event create kare
 * @param {{ datetime: Date, patientName: string }} appt
 * @returns {Object} event data (isme event.id hota hai)
 */
async function createEvent(appt) {
  const event = {
    summary: `Nouman Clinic – ${appt.patientName}`,
    description: `Appointment for ${appt.patientName}`,
    start: { dateTime: appt.datetime.toISOString() },
    end:   { dateTime: new Date(appt.datetime.getTime() + 30*60000).toISOString() },
  };
  const res = await calendar.events.insert({
    calendarId: process.env.CALENDAR_ID,
    requestBody: event,
  });
  return res.data;
}

/**
 * Maujooda event ki timing update kare
 * @param {string} eventId
 * @param {{ datetime: Date }} appt
 */
async function updateEvent(eventId, appt) {
  await calendar.events.patch({
    calendarId: process.env.CALENDAR_ID,
    eventId,
    requestBody: {
      start: { dateTime: appt.datetime.toISOString() },
      end:   { dateTime: new Date(appt.datetime.getTime() + 30*60000).toISOString() },
    },
  });
}

/**
 * Event delete kare
 * @param {string} eventId
 */
async function deleteEvent(eventId) {
  await calendar.events.delete({
    calendarId: process.env.CALENDAR_ID,
    eventId,
  });
}

module.exports = { createEvent, updateEvent, deleteEvent };
