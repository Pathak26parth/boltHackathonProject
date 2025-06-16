import express from 'express';
import { body, validationResult } from 'express-validator';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all subjects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { department, semester, facultyId } = req.query;
    
    const filter = { isActive: true };
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (facultyId) filter.facultyId = facultyId;

    const subjects = await Subject.find(filter)
      .populate('facultyId', '_id username email employeeId')
      .sort({ department: 1, semester: 1, name: 1 });

    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subjects assigned to faculty
router.get('/my-subjects', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const facultyId = req.user.userId;

    const subjects = await Subject.find({ 
      facultyId, 
      isActive: true 
    }).sort({ name: 1 });

    res.json({ subjects });
  } catch (error) {
    console.error('Get faculty subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new subject (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), [
  body('name').notEmpty().trim().escape(),
  body('code').notEmpty().trim().toUpperCase(),
  body('department').isIn(['CSE', 'ME', 'CE', 'EE', 'ECE']),
  body('credits').isInt({ min: 1, max: 6 }),
  body('semester').isInt({ min: 1, max: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, department, credits, semester, facultyId, description } = req.body;

    // Check if subject code already exists
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject code already exists' });
    }

    const subjectData = {
      name,
      code,
      department,
      credits,
      semester,
      description
    };

    // If faculty is assigned, validate and add faculty info
    if (facultyId) {
      const faculty = await User.findById(facultyId);
      if (!faculty || faculty.role !== 'faculty') {
        return res.status(400).json({ message: 'Invalid faculty ID' });
      }
      subjectData.facultyId = facultyId;
      subjectData.facultyName = faculty.username;
    }

    const subject = new Subject(subjectData);
    await subject.save();

    const populatedSubject = await Subject.findById(subject._id)
      .populate('facultyId', 'username email employeeId');

    res.status(201).json({
      message: 'Subject created successfully',
      subject: populatedSubject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update subject (Admin only)
router.put('/:subjectId', authenticateToken, requireRole(['admin']), [
  body('name').optional().notEmpty().trim().escape(),
  body('code').optional().notEmpty().trim().toUpperCase(),
  body('department').optional().isIn(['CSE', 'ME', 'CE', 'EE', 'ECE']),
  body('credits').optional().isInt({ min: 1, max: 6 }),
  body('semester').optional().isInt({ min: 1, max: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subjectId } = req.params;
    const { name, code, department, credits, semester, facultyId, description } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if new code conflicts with existing subjects
    if (code && code !== subject.code) {
      const existingSubject = await Subject.findOne({ code });
      if (existingSubject) {
        return res.status(400).json({ message: 'Subject code already exists' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (code) updateData.code = code;
    if (department) updateData.department = department;
    if (credits) updateData.credits = credits;
    if (semester) updateData.semester = semester;
    if (description !== undefined) updateData.description = description;

    // Handle faculty assignment
    if (facultyId) {
      const faculty = await User.findById(facultyId);
      if (!faculty || faculty.role !== 'faculty') {
        return res.status(400).json({ message: 'Invalid faculty ID' });
      }
      updateData.facultyId = facultyId;
      updateData.facultyName = faculty.username;
    } else if (facultyId === null) {
      updateData.facultyId = null;
      updateData.facultyName = null;
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      subjectId,
      updateData,
      { new: true, runValidators: true }
    ).populate('facultyId', 'username email employeeId');

    res.json({
      message: 'Subject updated successfully',
      subject: updatedSubject
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete subject (Admin only)
router.delete('/:subjectId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findByIdAndUpdate(
      subjectId,
      { isActive: false },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;