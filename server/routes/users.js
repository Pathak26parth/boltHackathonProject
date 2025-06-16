import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { role, department, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;

    const users = await User.find(filter)
      .select('-password')
      .populate('assignedSubjects')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students by department and division
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const { department, division, semester } = req.query;
    
    const filter = { role: 'student' };
    if (department) filter.department = department;
    if (division) filter.division = division;
    if (semester) filter.semester = semester;

    const students = await User.find(filter)
      .select('-password')
      .sort({ enrollmentNumber: 1 });

    res.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get faculty by department
router.get('/faculty', authenticateToken, async (req, res) => {
  try {
    const { department } = req.query;
    
    const filter = { role: 'faculty' };
    if (department) filter.department = department;

    const faculty = await User.find(filter)
      .select('-password')
      .populate('assignedSubjects')
      .sort({ employeeId: 1 });

    res.json({ faculty });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('username').optional().isLength({ min: 3 }).trim().escape(),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email } = req.body;
    const userId = req.user.userId;

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign subjects to faculty (Admin only)
router.put('/:userId/assign-subjects', authenticateToken, requireRole(['admin']), [
  body('subjectIds').isArray().withMessage('Subject IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { subjectIds } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== 'faculty') {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    user.assignedSubjects = subjectIds;
    await user.save();

    const updatedUser = await User.findById(userId)
      .populate('assignedSubjects')
      .select('-password');

    res.json({ 
      message: 'Subjects assigned successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Assign subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (Admin only)
router.delete('/:userId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;