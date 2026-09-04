const { runQuery, getQuery, allQuery } = require('../config/db');
const { analyzeRouteProgress, checkTargetStopProximity } = require('../services/etaService');
const { detectRouteAnomaly } = require('../services/aiService');

function registerTrackingSockets(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for specific bus tracking
    socket.on('join_bus_room', (busId) => {
      socket.join(`bus:${busId}`);
    });

    // Driver starts trip
    socket.on('driver:start_trip', async (data) => {
      try {
        const { busId, driverId, routeId } = data;
        await runQuery(`UPDATE buses SET status = 'active' WHERE id = ?`, [busId]);

        const activeTrip = await getQuery(
          `SELECT id FROM trips WHERE bus_id = ? AND status = 'in_progress'`,
          [busId]
        );

        let tripId;
        if (activeTrip) {
          tripId = activeTrip.id;
        } else {
          const result = await runQuery(`
            INSERT INTO trips (bus_id, driver_id, route_id, status, start_time, passenger_count)
            VALUES (?, ?, ?, 'in_progress', CURRENT_TIMESTAMP, 38)
          `, [busId, driverId || 1, routeId || 1]);
          tripId = result.lastID;
        }

        io.emit('trip:started', {
          tripId,
          busId,
          routeId,
          timestamp: new Date().toISOString()
        });

        socket.emit('driver:start_trip_success', { tripId });
      } catch (err) {
        console.error('[Socket.IO] Error starting trip:', err);
      }
    });

    // Driver continuous location update stream
    socket.on('driver:location_update', async (data) => {
      try {
        const { busId, tripId, lat, lng, speed = 0, heading = 0, passengerCount, targetStop } = data;

        if (!busId || lat === undefined || lng === undefined) return;

        const now = new Date().toISOString();

        // Update bus position in DB
        await runQuery(`
          UPDATE buses 
          SET current_lat = ?, current_lng = ?, current_speed = ?, heading = ?, last_updated = ?
          WHERE id = ?
        `, [lat, lng, speed, heading, now, busId]);

        if (passengerCount !== undefined && tripId) {
          await runQuery(`UPDATE trips SET passenger_count = ? WHERE id = ?`, [passengerCount, tripId]);
        }

        if (tripId) {
          await runQuery(`
            INSERT INTO gps_logs (trip_id, bus_id, lat, lng, speed, heading, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [tripId, busId, lat, lng, speed, heading, now]);
        }

        const bus = await getQuery(`SELECT * FROM buses WHERE id = ?`, [busId]);
        const stops = await allQuery(`
          SELECT * FROM stops 
          WHERE route_id = ? 
          ORDER BY sequence_order ASC
        `, [bus ? bus.assigned_route_id : 1]);

        const routeAnalysis = analyzeRouteProgress(lat, lng, speed, stops);
        const anomaly = detectRouteAnomaly(lat, lng, stops, speed);
        const targetProximity = targetStop 
          ? checkTargetStopProximity(lat, lng, targetStop, routeAnalysis.remainingStops)
          : null;

        const updatePayload = {
          busId,
          busNumber: bus ? bus.bus_number : `Bus ${busId}`,
          regNumber: bus ? bus.reg_number : 'KA 19 AB 1234',
          tripId,
          lat,
          lng,
          speed: Math.round(speed),
          heading,
          timestamp: now,
          status: 'active',
          passengerCount: passengerCount || 38,
          routeAnalysis,
          anomaly,
          targetProximity
        };

        io.to(`bus:${busId}`).emit('bus:location_update', updatePayload);
        io.emit('fleet:location_update', updatePayload);

      } catch (err) {
        console.error('[Socket.IO] Error processing location update:', err);
      }
    });

    // Driver ends trip
    socket.on('driver:end_trip', async (data) => {
      try {
        const { busId, tripId } = data;

        await runQuery(`UPDATE buses SET status = 'idle', current_speed = 0 WHERE id = ?`, [busId]);
        if (tripId) {
          await runQuery(`
            UPDATE trips 
            SET status = 'completed', end_time = CURRENT_TIMESTAMP 
            WHERE id = ?
          `, [tripId]);
        }

        io.emit('trip:ended', {
          tripId,
          busId,
          timestamp: new Date().toISOString()
        });

        socket.emit('driver:end_trip_success', { message: 'Trip completed successfully' });
      } catch (err) {
        console.error('[Socket.IO] Error ending trip:', err);
      }
    });
  });
}

module.exports = registerTrackingSockets;
