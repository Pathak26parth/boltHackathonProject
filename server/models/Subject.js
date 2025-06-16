import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'ME', 'CE', 'EE', 'ECE']
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  facultyName: {
    type: String,
    required: false
  },
  description: {
    type: String,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  syllabus: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
subjectSchema.index({ department: 1, semester: 1 });
subjectSchema.index({ facultyId: 1 });

export default mongoose.model('Subject', subjectSchema);