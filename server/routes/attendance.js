import express from 'express';
import { body, validationResult } from 'express-validator';
import Attendance from '../models/Attendance.js';
import AttendanceSession from '../models/AttendanceSession.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Start attendance session (Faculty only)
router.post('/session/start', authenticateToken, requireRole(['faculty']), [
  body('subjectId').isMongoId(),
  body('division').isIn(['A', 'B', 'C']),
  body('department').isIn(['CSE', 'ME', 'CE', 'EE', 'ECE']),
  body('semester').isInt({ min: 1, max: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subjectId, division, department, semester } = req.body;
    const facultyId = req.user.userId;

    // Validate subject
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(400).json({ message: 'Subject not found' });
    }

    // Get faculty info
    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(400).json({ message: 'Faculty not found' });
    }

    // Count total students in the division
    const totalStudents = await User.countDocuments({
      role: 'student',
      department,
      division,
      semester,
      isActive: true
    });

    // Generate unique session ID
    const sessionId = `${Date.now()}_${facultyId}_${subjectId}`;

    const session = new AttendanceSession({
      sessionId,
      subject: subjectId,
      subjectName: subject.name,
      faculty: facultyId,
      facultyName: faculty.username,
      date: new Date(),
      startTime: new Date(),
      division,
      department,
      semester,
      totalStudents,
      status: 'active'
    });

    await session.save();

    res.status(201).json({
      message: 'Attendance session started successfully',
      session
    });
  } catch (error) {
    console.error('Start attendance session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// End attendance session (Faculty only)
router.put('/session/:sessionId/end', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const facultyId = req.user.userId;

    const session = await AttendanceSession.findOne({
      sessionId,
      faculty: facultyId,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({ message: 'Active session not found' });
    }

    // Count present and absent students
    const presentCount = await Attendance.countDocuments({
      sessionId,
      status: 'present'
    });

    const absentCount = session.totalStudents - presentCount;

    session.endTime = new Date();
    session.presentStudents = presentCount;
    session.absentStudents = absentCount;
    session.status = 'completed';

    await session.save();

    res.json({
      message: 'Attendance session ended successfully',
      session
    });
  } catch (error) {
    console.error('End attendance session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark attendance (Faculty only)
router.post('/mark', authenticateToken, requireRole(['faculty']), [
  body('sessionId').notEmpty(),
  body('studentId').isMongoId(),
  body('status').isIn(['present', 'absent', 'late'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, studentId, status, detectionConfidence, remarks } = req.body;
    const facultyId = req.user.userId;

    // Validate session
    const session = await AttendanceSession.findOne({
      sessionId,
      faculty: facultyId,
      status: 'active'
    });

    if (!session) {
      return res.status(400).json({ message: 'Invalid or inactive session' });
    }

    // Validate student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Student not found' });
    }

    // Get faculty info
    const faculty = await User.findById(facultyId);

    // Check if attendance already marked
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      sessionId
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      existingAttendance.detectionConfidence = detectionConfidence || 0;
      existingAttendance.remarks = remarks || '';
      await existingAttendance.save();

      res.json({
        message: 'Attendance updated successfully',
        attendance: existingAttendance
      });
    } else {
      // Create new attendance record
      const attendance = new Attendance({
        student: studentId,
        studentName: student.username,
        enrollmentNumber: student.enrollmentNumber,
        subject: session.subject,
        subjectName: session.subjectName,
        faculty: facultyId,
        facultyName: faculty.username,
        date: session.date,
        status,
        division: session.division,
        department: session.department,
        semester: session.semester,
        sessionId,
        detectionConfidence: detectionConfidence || 0,
        remarks: remarks || ''
      });

      await attendance.save();

      res.status(201).json({
        message: 'Attendance marked successfully',
        attendance
      });
    }
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student attendance
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subjectId, startDate, endDate } = req.query;

    // Check if user can access this data
    if (req.user.role === 'student' && req.user.userId !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filter = { student: studentId };
    if (subjectId) filter.subject = subjectId;
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(filter)
      .populate('subject', 'name code credits')
      .populate('faculty', 'username')
      .sort({ date: -1 });

    // Calculate statistics
    const stats = {};
    attendance.forEach(record => {
      const subjectKey = record.subject._id.toString();
      if (!stats[subjectKey]) {
        stats[subjectKey] = {
          subjectName: record.subjectName,
          total: 0,
          present: 0,
          absent: 0,
          late: 0
        };
      }
      stats[subjectKey].total++;
      stats[subjectKey][record.status]++;
    });

    // Calculate percentages
    Object.keys(stats).forEach(key => {
      const stat = stats[key];
      stat.percentage = stat.total > 0 ? ((stat.present + stat.late) / stat.total * 100).toFixed(1) : 0;
      stat.status = stat.percentage >= 90 ? 'excellent' : stat.percentage >= 75 ? 'good' : 'bad';
    });

    res.json({
      attendance,
      statistics: Object.values(stats)
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance report (Faculty/Admin)
router.get('/report', authenticateToken, requireRole(['faculty', 'admin']), async (req, res) => {
  try {
    const { subjectId, division, department, semester, startDate, endDate, facultyId } = req.query;

    const filter = {};
    if (subjectId) filter.subject = subjectId;
    if (division) filter.division = division;
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (facultyId) filter.faculty = facultyId;
    
    // Faculty can only see their own data
    if (req.user.role === 'faculty') {
      filter.faculty = req.user.userId;
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(filter)
      .populate('student', 'username enrollmentNumber')
      .populate('subject', 'name code')
      .populate('faculty', 'username')
      .sort({ date: -1, studentName: 1 });

    res.json({ attendance });
  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance sessions (Faculty)
router.get('/sessions', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const facultyId = req.user.userId;
    const { status, limit = 10 } = req.query;

    const filter = { faculty: facultyId };
    if (status) filter.status = status;

    const sessions = await AttendanceSession.find(filter)
      .populate('subject', 'name code')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ sessions });
  } catch (error) {
    console.error('Get attendance sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;