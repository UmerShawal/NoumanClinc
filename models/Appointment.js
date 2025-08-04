const mongoose = require('mongoose');
const { Schema } = mongoose;

const appointmentSchema = new Schema({
  patient:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name:          { type: String, required: true },
  phone:         { type: String, required: true },
  area:          { type: String, required: true },
  disease:       { type: String, required: true },
  datetime:      { type: Date,   required: true },
  status:        { type: String, enum: ['booked','cancelled'], default: 'booked' },
  gcal_event_id: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
