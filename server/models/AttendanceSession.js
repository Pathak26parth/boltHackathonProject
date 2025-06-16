import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
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
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  division: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C']
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
  totalStudents: {
    type: Number,
    required: true,
    default: 0
  },
  presentStudents: {
    type: Number,
    default: 0
  },
  absentStudents: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  aiDetectionEnabled: {
    type: Boolean,
    default: true
  },
  cameraFeed: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('AttendanceSession', attendanceSessionSchema);