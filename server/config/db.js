const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDB() {
  console.log('[Database] Initializing SQLite tables...');
  
  db.serialize(async () => {
    // 1. Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('student', 'driver', 'admin')) NOT NULL,
        phone TEXT,
        student_id TEXT,
        assigned_stop_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Routes Table
    db.run(`
      CREATE TABLE IF NOT EXISTS routes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        start_location TEXT NOT NULL,
        end_location TEXT NOT NULL,
        total_distance_km REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Stops Table
    db.run(`
      CREATE TABLE IF NOT EXISTS stops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        route_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        sequence_order INTEGER NOT NULL,
        est_minutes_from_start INTEGER NOT NULL,
        FOREIGN KEY (route_id) REFERENCES routes (id) ON DELETE CASCADE
      )
    `);

    // 4. Buses Table
    db.run(`
      CREATE TABLE IF NOT EXISTS buses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bus_number TEXT UNIQUE NOT NULL,
        reg_number TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        status TEXT CHECK(status IN ('active', 'idle', 'maintenance')) DEFAULT 'idle',
        assigned_route_id INTEGER,
        current_lat REAL,
        current_lng REAL,
        current_speed REAL DEFAULT 0,
        heading REAL DEFAULT 0,
        last_updated DATETIME,
        FOREIGN KEY (assigned_route_id) REFERENCES routes (id)
      )
    `);

    // 5. Drivers Table
    db.run(`
      CREATE TABLE IF NOT EXISTS drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        license_no TEXT NOT NULL,
        phone TEXT,
        assigned_bus_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_bus_id) REFERENCES buses (id)
      )
    `);

    // 6. Trips Table
    db.run(`
      CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bus_id INTEGER NOT NULL,
        driver_id INTEGER NOT NULL,
        route_id INTEGER NOT NULL,
        status TEXT CHECK(status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
        start_time DATETIME,
        end_time DATETIME,
        passenger_count INTEGER DEFAULT 0,
        current_stop_id INTEGER,
        next_stop_id INTEGER,
        eta_minutes INTEGER,
        FOREIGN KEY (bus_id) REFERENCES buses (id),
        FOREIGN KEY (driver_id) REFERENCES drivers (id),
        FOREIGN KEY (route_id) REFERENCES routes (id)
      )
    `);

    // 7. GPS Logs Table
    db.run(`
      CREATE TABLE IF NOT EXISTS gps_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        bus_id INTEGER NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        speed REAL DEFAULT 0,
        heading REAL DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips (id)
      )
    `);

    // 8. Notifications Table
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        target_role TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed/Reset Users to ensure Vinod Patil is saved
    const studentUser = await getQuery("SELECT * FROM users WHERE email = 'vinod@ridesense.ai'");
    if (!studentUser || studentUser.name !== 'Vinod Patil') {
      console.log('[Database] Seeding/Updating user Vinod Patil & Route 101...');
      await seedDatabase();
    }
  });
}

async function seedDatabase() {
  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('password123', salt);

  // Clear existing to re-seed cleanly
  await runQuery('DELETE FROM stops');
  await runQuery('DELETE FROM routes');
  await runQuery('DELETE FROM buses');
  await runQuery('DELETE FROM drivers');
  await runQuery('DELETE FROM users');
  await runQuery('DELETE FROM trips');

  // 1. Seed Routes (Route 101 - Mangaluru -> Udupi)
  await runQuery(`
    INSERT INTO routes (id, name, code, start_location, end_location, total_distance_km)
    VALUES 
    (1, 'Route 101 - Mangaluru Express', 'R-101', 'Mangaluru Central', 'Udupi Terminal', 58.0),
    (2, 'Route 204 - Campus Shuttle', 'R-204', 'Hostel Block A', 'Engineering Complex', 14.2),
    (3, 'Route 308 - City Connector', 'R-308', 'Railway Junction', 'Airport Terminal', 22.5)
  `);

  // 2. Seed Stops for Route 101 (Mangaluru -> Udupi)
  const stopsR101 = [
    { name: 'Mangaluru Central (Origin)', lat: 12.8681, lng: 74.8423, seq: 1, est: 0 },
    { name: 'Kottara', lat: 12.8988, lng: 74.8456, seq: 2, est: 8 },
    { name: 'Kottara Chowki', lat: 12.9051, lng: 74.8512, seq: 3, est: 14 },
    { name: 'Surathkal Junction', lat: 12.9812, lng: 74.8021, seq: 4, est: 26 },
    { name: 'Mulki Terminal', lat: 13.0845, lng: 74.7890, seq: 5, est: 38 },
    { name: 'Padubidri Circle', lat: 13.1342, lng: 74.7745, seq: 6, est: 48 },
    { name: 'Udupi Terminal (Destination)', lat: 13.3409, lng: 74.7421, seq: 7, est: 58 }
  ];

  for (const s of stopsR101) {
    await runQuery(`
      INSERT INTO stops (route_id, name, lat, lng, sequence_order, est_minutes_from_start)
      VALUES (1, ?, ?, ?, ?, ?)
    `, [s.name, s.lat, s.lng, s.seq, s.est]);
  }

  // 3. Seed Buses
  await runQuery(`
    INSERT INTO buses (id, bus_number, reg_number, capacity, status, assigned_route_id, current_lat, current_lng, current_speed)
    VALUES 
    (1, 'Bus 101', 'KA 19 AB 1234', 54, 'active', 1, 12.8988, 74.8456, 32.0),
    (2, 'Bus 102', 'KA 19 AB 5678', 48, 'active', 1, 12.9051, 74.8512, 28.0),
    (3, 'Bus 204', 'KA 19 AB 9012', 60, 'active', 2, 12.8681, 74.8423, 0.0)
  `);

  // 4. Seed Users - Vinod Patil as Student
  await runQuery(`
    INSERT INTO users (id, name, email, password, role, phone)
    VALUES (1, 'Admin User', 'admin@ridesense.ai', ?, 'admin', '+91 98765 43210')
  `, [defaultPassword]);

  await runQuery(`
    INSERT INTO users (id, name, email, password, role, phone)
    VALUES (2, 'Rajesh Kumar', 'driver03@ridesense.ai', ?, 'driver', '+91 98123 45678')
  `, [defaultPassword]);

  await runQuery(`
    INSERT INTO users (id, name, email, password, role, phone, student_id, assigned_stop_id)
    VALUES (4, 'Vinod Patil', 'vinod@ridesense.ai', ?, 'student', '+91 99887 76655', 'USN-2024-CS089', 3)
  `, [defaultPassword]);

  // 5. Seed Drivers table
  await runQuery(`
    INSERT INTO drivers (user_id, license_no, phone, assigned_bus_id)
    VALUES (2, 'DL-KA-2018-994821', '+91 98123 45678', 1)
  `);

  // 6. Seed Active Trip
  await runQuery(`
    INSERT INTO trips (id, bus_id, driver_id, route_id, status, start_time, passenger_count, current_stop_id, next_stop_id, eta_minutes)
    VALUES (1, 1, 1, 1, 'in_progress', CURRENT_TIMESTAMP, 38, 2, 3, 8)
  `);

  // 7. Seed Notifications
  await runQuery(`
    INSERT INTO notifications (target_role, title, message, type)
    VALUES 
    ('student', 'Bus 101 Active', 'KA 19 AB 1234 is approaching Kottara Chowki.', 'info'),
    ('student', 'Route 101 Update', '3 active buses operating on Mangaluru → Udupi corridor.', 'info')
  `);

  console.log('[Database] Seed completed successfully with user Vinod Patil!');
}

module.exports = {
  db,
  initDB,
  runQuery,
  getQuery,
  allQuery
};
