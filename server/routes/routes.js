const express = require('express');
const router = express.Router();
const { allQuery, getQuery, runQuery } = require('../config/db');

// GET /api/routes - List all routes with stops
router.get('/', async (req, res) => {
  try {
    const routes = await allQuery(`SELECT * FROM routes ORDER BY id ASC`);
    const result = await Promise.all(
      routes.map(async (route) => {
        const stops = await allQuery(`
          SELECT * FROM stops WHERE route_id = ? ORDER BY sequence_order ASC
        `, [route.id]);
        return { ...route, stops };
      })
    );
    res.json({ routes: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// GET /api/routes/search - Search routes between FROM and TO locations
router.get('/search', async (req, res) => {
  try {
    const { from, to } = req.query;

    const routes = await allQuery(`SELECT * FROM routes ORDER BY id ASC`);
    const searchResults = [];

    for (const route of routes) {
      const stops = await allQuery(`
        SELECT * FROM stops WHERE route_id = ? ORDER BY sequence_order ASC
      `, [route.id]);

      const fromMatch = !from || 
        route.start_location.toLowerCase().includes(from.toLowerCase()) ||
        stops.some(s => s.name.toLowerCase().includes(from.toLowerCase()));

      const toMatch = !to || 
        route.end_location.toLowerCase().includes(to.toLowerCase()) ||
        stops.some(s => s.name.toLowerCase().includes(to.toLowerCase()));

      if (fromMatch && toMatch) {
        const activeBuses = await allQuery(`
          SELECT * FROM buses WHERE assigned_route_id = ?
        `, [route.id]);

        searchResults.push({
          ...route,
          stops,
          activeBusesCount: activeBuses.length,
          buses: activeBuses.map(b => ({
            id: b.id,
            busNumber: b.bus_number,
            regNumber: b.reg_number,
            status: b.status,
            speed: b.current_speed || 32,
            currentLocation: 'Kottara',
            nextStop: 'Kottara Chowki',
            nextBusArrivalMinutes: 8,
            estimatedTravelTimeMinutes: Math.round(route.total_distance_km * 1.0)
          }))
        });
      }
    }

    res.json({ searchResults });
  } catch (err) {
    res.status(500).json({ error: 'Failed to search routes' });
  }
});

// GET /api/routes/:id - Get single route with stops
router.get('/:id', async (req, res) => {
  try {
    const route = await getQuery(`SELECT * FROM routes WHERE id = ?`, [req.params.id]);
    if (!route) return res.status(404).json({ error: 'Route not found' });

    const stops = await allQuery(`
      SELECT * FROM stops WHERE route_id = ? ORDER BY sequence_order ASC
    `, [route.id]);

    res.json({ route: { ...route, stops } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch route details' });
  }
});

// POST /api/routes - Create route with stops
router.post('/', async (req, res) => {
  try {
    const { name, code, startLocation, endLocation, totalDistanceKm, stops } = req.body;
    
    const result = await runQuery(`
      INSERT INTO routes (name, code, start_location, end_location, total_distance_km)
      VALUES (?, ?, ?, ?, ?)
    `, [name, code, startLocation, endLocation, totalDistanceKm || 10]);

    const routeId = result.lastID;

    if (stops && Array.isArray(stops)) {
      for (let i = 0; i < stops.length; i++) {
        const s = stops[i];
        await runQuery(`
          INSERT INTO stops (route_id, name, lat, lng, sequence_order, est_minutes_from_start)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [routeId, s.name, s.lat, s.lng, i + 1, s.estMinutesFromStart || (i * 6)]);
      }
    }

    res.status(201).json({ message: 'Route created successfully', routeId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create route' });
  }
});

module.exports = router;
