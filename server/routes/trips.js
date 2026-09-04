const express = require('express');
const router = express.Router();
const { allQuery, getQuery, runQuery } = require('../config/db');

// GET /api/trips - Get trip history
router.get('/', async (req, res) => {
  try {
    const trips = await allQuery(`
      SELECT 
        t.*,
        b.bus_number,
        b.reg_number,
        r.name as route_name,
        r.code as route_code,
        u.name as driver_name
      FROM trips t
      JOIN buses b ON t.bus_id = b.id
      JOIN routes r ON t.route_id = r.id
      JOIN drivers d ON t.driver_id = d.id
      JOIN users u ON d.user_id = u.id
      ORDER BY t.id DESC
      LIMIT 50
    `);

    res.json({ trips });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trip history' });
  }
});

// GET /api/trips/:id/logs - Get recorded GPS points for trip playback
router.get('/:id/logs', async (req, res) => {
  try {
    const trip = await getQuery(`SELECT * FROM trips WHERE id = ?`, [req.params.id]);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const logs = await allQuery(`
      SELECT lat, lng, speed, heading, timestamp 
      FROM gps_logs 
      WHERE trip_id = ? 
      ORDER BY id ASC
    `, [req.params.id]);

    res.json({ trip, logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trip GPS logs' });
  }
});

module.exports = router;
