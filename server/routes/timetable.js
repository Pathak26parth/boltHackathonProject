import express from 'express';
import { body, validationResult } from 'express-validator';
import Timetable from '../models/Timetable.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get timetable
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { department, division, semester, facultyId, day } = req.query;
    
    const filter = { isActive: true };
    if (department) filter.department = department;
    if (division) filter.division = division;
    if (semester) filter.semester = semester;
    if (facultyId) filter.faculty = facultyId;
    if (day) filter.day = day;
    
    const timetable = await Timetable.find(filter)
      .populate('subjectId', 'name code credits')
      .populate('faculty', 'username email employeeId')
      .sort({ day: 1, time: 1 });

      res.json({ timetable });
    } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get faculty timetable
router.get('/my-schedule', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const facultyId = req.user.userId;
    
    const timetable = await Timetable.find({ 
      faculty: facultyId, 
      isActive: true 
    })
      .populate('subject', 'name code credits')
      .sort({ day: 1, time: 1 });
      
      res.json({ timetable });
    } catch (error) {
    console.error('Get faculty timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create timetable entry (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), [
  body('day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
  body('time').notEmpty().trim(),
  body('subjectId').isMongoId(),
  body('faculty').isMongoId(),
  body('division').isIn(['A', 'B', 'C']),
  body('room').notEmpty().trim(),
  body('department').isIn(['CSE', 'ME', 'CE', 'EE', 'ECE']),
  body('semester').isInt({ min: 1, max: 8 })
], async (req, res) => {

  try {
    const errors = validationResult(req);
    console.log('ghusa bck');
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    const { day, time, subjectId, faculty, division, room, department, semester, duration } = req.body;
    console.log('Query parameters:', { day, time, subjectId, faculty, division, room, department, semester, duration });

    // Validate subject exists
    const subjectDoc = await Subject.findById(subjectId);
    if (!subjectDoc) {
      console.log('Subject not found:', subjectName);
      return res.status(400).json({ message: 'Subject not found' });
    }

    // Validate faculty exists
    const facultyDoc = await User.findById(faculty);
    if (!facultyDoc || facultyDoc.role !== 'faculty') {
      return res.status(400).json({ message: 'Faculty not found' });
    }

    // Check for room conflicts
    const roomConflict = await Timetable.findOne({
      day,
      time,
      room,
      isActive: true
    });

    if (roomConflict) {
      return res.status(400).json({ message: 'Room is already booked for this time slot' });
    }

    // Check for faculty conflicts
    const facultyConflict = await Timetable.findOne({
      day,
      time,
      faculty,
      isActive: true
    });

    if (facultyConflict) {
      return res.status(400).json({ message: 'Faculty is already assigned for this time slot' });
    }

    const timetableEntry = new Timetable({
      day,
      time,
      subjectId: subjectDoc._id,
      subjectName: subjectDoc.name,
      faculty,
      facultyName: facultyDoc.username,
      division,
      room,
      department,
      semester,
      duration: duration || 60
    });

    console.log('Timetable entry data:', timetableEntry);
    
    await timetableEntry.save();

    const populatedEntry = await Timetable.findById(timetableEntry._id)
      .populate('subjectId', 'name code credits')
      .populate('faculty', 'username email employeeId');

    res.status(201).json({
      message: 'Timetable entry created successfully',
      timetable: populatedEntry
    });
  } catch (error) {
    console.error('Create timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update timetable entry (Admin only)
router.put('/:entryId', authenticateToken, requireRole(['admin']), [
  body('day').optional().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
  body('time').optional().notEmpty().trim(),
  body('subjectId').optional().isMongoId(),
  body('faculty').optional().isMongoId(),
  body('division').optional().isIn(['A', 'B', 'C']),
  body('room').optional().notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { entryId } = req.params;
    const { day, time, subjectId, faculty, division, room, duration } = req.body;

    const entry = await Timetable.findById(entryId);
    if (!entry) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    const updateData = {};
    if (day) updateData.day = day;
    if (time) updateData.time = time;
    if (division) updateData.division = division;
    if (room) updateData.room = room;
    if (duration) updateData.duration = duration;

    // Handle subject update
    if (subjectId) {
      const subjectDoc = await Subject.findById(subjectId);
      if (!subjectDoc) {
        return res.status(400).json({ message: 'Subject not found' });
      }
      updateData.subjectId = subjectId;
      updateData.subjectName = subjectDoc.name;
    }

    // Handle faculty update
    if (faculty) {
      const facultyDoc = await User.findById(faculty);
      if (!facultyDoc || facultyDoc.role !== 'faculty') {
        return res.status(400).json({ message: 'Faculty not found' });
      }
      updateData.faculty = faculty;
      updateData.facultyName = facultyDoc.username;
    }

    // Check for conflicts if time/room/faculty changed
    if (day || time || room || faculty) {
      const checkDay = day || entry.day;
      const checkTime = time || entry.time;
      const checkRoom = room || entry.room;
      const checkFaculty = faculty || entry.faculty;

      // Check room conflict
      if (room || time || day) {
        const roomConflict = await Timetable.findOne({
          _id: { $ne: entryId },
          day: checkDay,
          time: checkTime,
          room: checkRoom,
          isActive: true
        });

        if (roomConflict) {
          return res.status(400).json({ message: 'Room is already booked for this time slot' });
        }
      }

      // Check faculty conflict
      if (faculty || time || day) {
        const facultyConflict = await Timetable.findOne({
          _id: { $ne: entryId },
          day: checkDay,
          time: checkTime,
          faculty: checkFaculty,
          isActive: true
        });

        if (facultyConflict) {
          return res.status(400).json({ message: 'Faculty is already assigned for this time slot' });
        }
      }
    }

    const updatedEntry = await Timetable.findByIdAndUpdate(
      entryId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('subjectId', 'name code credits')
      .populate('faculty', 'username email employeeId');

    res.json({
      message: 'Timetable entry updated successfully',
      timetable: updatedEntry
    });
  } catch (error) {
    console.error('Update timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete timetable entry (Admin only)
router.delete('/:entryId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { entryId } = req.params;

    const entry = await Timetable.findByIdAndUpdate(
      entryId,
      { isActive: false },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('Delete timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;