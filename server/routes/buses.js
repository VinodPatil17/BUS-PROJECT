const express = require('express');
const router = express.Router();
const { allQuery, getQuery, runQuery } = require('../config/db');

// GET /api/buses - List all buses with route and driver details
router.get('/', async (req, res) => {
  try {
    const buses = await allQuery(`
      SELECT 
        b.*,
        r.name as route_name,
        r.code as route_code,
        u.name as driver_name,
        u.phone as driver_phone
      FROM buses b
      LEFT JOIN routes r ON b.assigned_route_id = r.id
      LEFT JOIN drivers d ON d.assigned_bus_id = b.id
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY b.id ASC
    `);
    res.json({ buses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch buses list' });
  }
});

// GET /api/buses/:id - Get single bus with stops & route details
router.get('/:id', async (req, res) => {
  try {
    const bus = await getQuery(`
      SELECT 
        b.*,
        r.name as route_name,
        r.code as route_code,
        r.start_location,
        r.end_location,
        u.name as driver_name,
        u.phone as driver_phone
      FROM buses b
      LEFT JOIN routes r ON b.assigned_route_id = r.id
      LEFT JOIN drivers d ON d.assigned_bus_id = b.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE b.id = ?
    `, [req.params.id]);

    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    const stops = await allQuery(`
      SELECT * FROM stops 
      WHERE route_id = ? 
      ORDER BY sequence_order ASC
    `, [bus.assigned_route_id || 1]);

    const activeTrip = await getQuery(`
      SELECT * FROM trips 
      WHERE bus_id = ? AND status = 'in_progress'
    `, [bus.id]);

    res.json({ bus, stops, activeTrip });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bus details' });
  }
});

// POST /api/buses - Add new bus (Admin)
router.post('/', async (req, res) => {
  try {
    const { busNumber, regNumber, capacity, routeId } = req.body;
    const result = await runQuery(`
      INSERT INTO buses (bus_number, reg_number, capacity, status, assigned_route_id, current_lat, current_lng)
      VALUES (?, ?, ?, 'idle', ?, 12.8924, 74.8412)
    `, [busNumber, regNumber, capacity || 50, routeId || 1]);

    res.status(201).json({ message: 'Bus created successfully', busId: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create bus' });
  }
});

// PUT /api/buses/:id - Update bus
router.put('/:id', async (req, res) => {
  try {
    const { busNumber, regNumber, capacity, status, routeId } = req.body;
    await runQuery(`
      UPDATE buses 
      SET bus_number = ?, reg_number = ?, capacity = ?, status = ?, assigned_route_id = ?
      WHERE id = ?
    `, [busNumber, regNumber, capacity, status, routeId, req.params.id]);

    res.json({ message: 'Bus updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update bus' });
  }
});

// DELETE /api/buses/:id - Delete bus
router.delete('/:id', async (req, res) => {
  try {
    await runQuery(`DELETE FROM buses WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Bus deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete bus' });
  }
});

module.exports = router;
