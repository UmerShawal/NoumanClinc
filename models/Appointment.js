// models/Appointment.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  patient:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  datetime:      { type: Date, required: true },
  status:        { type: String, enum: ['booked','cancelled'], default: 'booked' },
  gcal_event_id: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
