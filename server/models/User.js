import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'ME', 'CE', 'EE', 'ECE']
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'faculty', 'student'],
    default: 'student'
  },
  profileImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  enrollmentNumber: {
    type: String,
    sparse: true,
    unique: true
  },
  employeeId: {
    type: String,
    sparse: true,
    unique: true
  },
  division: {
    type: String,
    enum: ['A', 'B', 'C'],
    required: function() {
      return this.role === 'student';
    }
  },
  semester: {
    type: Number,
    min: 1,
    max: 8,
    required: function() {
      return this.role === 'student';
    }
  },
  assignedSubjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate enrollment number for students
userSchema.pre('save', function(next) {
  if (this.role === 'student' && !this.enrollmentNumber) {
    const year = new Date().getFullYear().toString().slice(-2);
    const deptCode = this.department;
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.enrollmentNumber = `${year}${deptCode}${random}`;
  }
  
  if (this.role === 'faculty' && !this.employeeId) {
    const deptCode = this.department;
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.employeeId = `FAC${deptCode}${random}`;
  }
  
  next();
});

export default mongoose.model('User', userSchema);