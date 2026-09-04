const express = require('express');
const router = express.Router();
const { getQuery, allQuery } = require('../config/db');
const { generateAiInsightsReport } = require('../services/aiService');

// GET /api/ai/insights/:busId - Get AI predictions report for a bus
router.get('/insights/:busId', async (req, res) => {
  try {
    const bus = await getQuery(`SELECT * FROM buses WHERE id = ?`, [req.params.busId]);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    const stops = await allQuery(`
      SELECT * FROM stops WHERE route_id = ? ORDER BY sequence_order ASC
    `, [bus.assigned_route_id || 1]);

    const report = generateAiInsightsReport(bus, stops);
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate AI insights' });
  }
});

// GET /api/ai/fleet-overview - Get fleet-wide AI predictions summary
router.get('/fleet-overview', async (req, res) => {
  try {
    const buses = await allQuery(`SELECT * FROM buses WHERE status = 'active'`);
    const insights = await Promise.all(
      buses.map(async (bus) => {
        const stops = await allQuery(`SELECT * FROM stops WHERE route_id = ?`, [bus.assigned_route_id || 1]);
        return generateAiInsightsReport(bus, stops);
      })
    );

    res.json({
      fleetSize: buses.length,
      activeInsights: insights,
      systemHealth: 'OPTIMAL',
      overallOnTimeRate: '92.8%'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fleet AI summary' });
  }
});

module.exports = router;
