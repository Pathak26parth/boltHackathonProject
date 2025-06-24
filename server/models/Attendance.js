import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  enrollmentNumber: {
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
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['present', 'absent', 'late']
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
  sessionId: {
    type: String,
    required: true
  },
  detectionConfidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // remarks: {
  //   type: String,
  //   maxlength: 200
  // }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ 
  student: 1, 
  subject: 1, 
  date: 1, 
  sessionId: 1 
}, { unique: true });

// Index for efficient queries
attendanceSchema.index({ faculty: 1, date: 1 });
attendanceSchema.index({ student: 1, subject: 1 });
attendanceSchema.index({ department: 1, semester: 1, division: 1 });

export default mongoose.model('Attendance', attendanceSchema);