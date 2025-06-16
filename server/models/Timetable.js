import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  time: {
    type: String,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facultyName: {
    type: String,
    required: true
  },
  division: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C']
  },
  room: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'ME', 'CE', 'EE', 'ECE']
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  duration: {
    type: Number,
    default: 60 // in minutes
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent scheduling conflicts
timetableSchema.index({ day: 1, time: 1, room: 1 }, { unique: true });
timetableSchema.index({ faculty: 1, day: 1, time: 1 }, { unique: true });

export default mongoose.model('Timetable', timetableSchema);