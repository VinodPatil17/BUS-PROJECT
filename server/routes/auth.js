const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getQuery, runQuery } = require('../config/db');
const { JWT_SECRET, authenticateToken } = require('../middleware/authMiddleware');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await getQuery('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Role check if provided
    if (role && user.role !== role) {
      return res.status(403).json({ error: `Account is registered as ${user.role}, not ${role}` });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let extraDetails = {};
    if (user.role === 'driver') {
      const driver = await getQuery('SELECT * FROM drivers WHERE user_id = ?', [user.id]);
      if (driver) {
        extraDetails.driverId = driver.id;
        extraDetails.assignedBusId = driver.assigned_bus_id;
      }
    } else if (user.role === 'student') {
      extraDetails.assignedStopId = user.assigned_stop_id || 2;
    }

    const token = jwt.sign(
      { id: user.id, name: user.name || 'Vinod Patil', email: user.email, role: user.role, ...extraDetails },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name || 'Vinod Patil',
        email: user.email,
        role: user.role,
        studentId: user.student_id,
        ...extraDetails
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getQuery('SELECT id, name, email, role, phone, student_id, assigned_stop_id FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

module.exports = router;
