import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { Play, Square, Radio, Gauge, Users, Smartphone, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

export default function DriverDashboard() {
  const { user } = useAuth();
  const { socket, connectionStatus } = useSocket();

  const [tripStatus, setTripStatus] = useState('idle');
  const [tripId, setTripId] = useState(null);
  const [busDetails, setBusDetails] = useState(null);
  const [stops, setStops] = useState([]);
  
  const [coords, setCoords] = useState({ lat: 12.8988, lng: 74.8456, speed: 0, heading: 0 });
  const [passengerCount, setPassengerCount] = useState(38);
  const [gpsStatus, setGpsStatus] = useState('offline');
  const [gpsErrorMessage, setGpsErrorMessage] = useState('');

  const [demoMode, setDemoMode] = useState(false);
  const watchIdRef = useRef(null);
  const demoIntervalRef = useRef(null);
  const demoStepRef = useRef(0);

  const busId = user?.assignedBusId || 1;

  useEffect(() => {
    fetchDriverBusData();

    return () => {
      stopGpsTracking();
      stopDemoSimulation();
    };
  }, []);

  const fetchDriverBusData = async () => {
    try {
      const res = await api.get(`/buses/${busId}`);
      setBusDetails(res.data.bus);
      setStops(res.data.stops || []);
      if (res.data.activeTrip) {
        setTripStatus('in_progress');
        setTripId(res.data.activeTrip.id);
      }
    } catch (err) {
      console.error('Error fetching driver bus data:', err);
    }
  };

  const handleStartTrip = () => {
    setTripStatus('in_progress');
    socket.emit('driver:start_trip', {
      busId,
      driverId: user?.driverId || 1,
      routeId: busDetails?.assigned_route_id || 1
    });

    if (demoMode) {
      startDemoSimulation();
    } else {
      startRealGpsTracking();
    }
  };

  const handleEndTrip = () => {
    setTripStatus('idle');
    stopGpsTracking();
    stopDemoSimulation();

    socket.emit('driver:end_trip', { busId, tripId });
    setGpsStatus('offline');
  };

  const startRealGpsTracking = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsErrorMessage('Geolocation API is not supported on this device.');
      return;
    }

    setGpsStatus('active');
    setGpsErrorMessage('');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        const speedKmh = speed ? Math.round(speed * 3.6) : Math.floor(25 + Math.random() * 10);
        
        setCoords({ lat: latitude, lng: longitude, speed: speedKmh, heading: heading || 0 });

        socket.emit('driver:location_update', {
          busId,
          tripId,
          lat: latitude,
          lng: longitude,
          speed: speedKmh,
          heading: heading || 0,
          passengerCount
        });
      },
      (err) => {
        setGpsStatus('error');
        setGpsErrorMessage(err.message || 'GPS signal lost or permission denied.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const stopGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const startDemoSimulation = () => {
    setGpsStatus('demo');
    setGpsErrorMessage('');

    const routeCoords = stops.length > 0
      ? stops.map(s => ({ lat: s.lat, lng: s.lng }))
      : [
          { lat: 12.8681, lng: 74.8423 },
          { lat: 12.8988, lng: 74.8456 },
          { lat: 12.9051, lng: 74.8512 },
          { lat: 12.9812, lng: 74.8021 }
        ];

    demoIntervalRef.current = setInterval(() => {
      const point = routeCoords[demoStepRef.current % routeCoords.length];
      const jitterLat = point.lat + (Math.random() - 0.5) * 0.0005;
      const jitterLng = point.lng + (Math.random() - 0.5) * 0.0005;
      const simSpeed = Math.floor(28 + Math.random() * 12);

      setCoords({ lat: jitterLat, lng: jitterLng, speed: simSpeed, heading: 45 });

      socket.emit('driver:location_update', {
        busId,
        tripId,
        lat: jitterLat,
        lng: jitterLng,
        speed: simSpeed,
        heading: 45,
        passengerCount
      });

      demoStepRef.current += 1;
    }, 2500);
  };

  const stopDemoSimulation = () => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-warmBg text-charcoal py-6 px-4 max-w-md mx-auto space-y-5">
      
      {/* Driver Cockpit Header */}
      <div className="card-clean p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sageSoft text-emeraldPrimary flex items-center justify-center font-bold">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-lg text-charcoal">Driver Cockpit</h1>
              <p className="text-xs text-emeraldPrimary font-bold">{user?.name || 'Rajesh Kumar'}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-charcoal block">Bus 101</span>
            <span className="text-[10px] text-mutedGray font-mono">KA 19 AB 1234</span>
          </div>
        </div>

        {/* Demo Mode Toggle */}
        <div className="pt-3 border-t border-borderLight flex items-center justify-between bg-warmBg p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emeraldPrimary" />
            <div>
              <span className="text-xs font-bold text-charcoal block">Dev Demo Simulation</span>
              <span className="text-[10px] text-mutedGray">Simulate movement without driving</span>
            </div>
          </div>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className="text-emeraldPrimary transition"
          >
            {demoMode ? (
              <ToggleRight className="w-8 h-8 text-emeraldPrimary" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-mutedGray" />
            )}
          </button>
        </div>
      </div>

      {/* GPS Status Indicator */}
      <div className="card-clean p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${gpsStatus === 'active' || gpsStatus === 'demo' ? 'bg-statusLive animate-pulse' : 'bg-statusError'}`}></div>
          <div>
            <span className="text-[10px] text-mutedGray block">GPS Telemetry Link</span>
            <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
              {gpsStatus === 'active' ? '🟢 Live Hardware GPS' : gpsStatus === 'demo' ? '⚡ Demo GPS Stream' : '🔴 Offline'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-mutedGray block">Server Sync</span>
          <span className="text-xs font-bold text-statusLive capitalize">{connectionStatus}</span>
        </div>
      </div>

      {gpsErrorMessage && (
        <div className="bg-red-50 border border-statusError/30 p-3 rounded-xl text-xs text-statusError flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{gpsErrorMessage}</span>
        </div>
      )}

      {/* Controls: START TRIP / END TRIP */}
      <div>
        {tripStatus === 'idle' ? (
          <button
            onClick={handleStartTrip}
            className="w-full py-4 rounded-2xl bg-emeraldPrimary hover:bg-emeraldDark text-white font-heading font-extrabold text-lg shadow-soft transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-6 h-6 fill-white" />
            START TRIP
          </button>
        ) : (
          <button
            onClick={handleEndTrip}
            className="w-full py-4 rounded-2xl bg-statusError hover:opacity-90 text-white font-heading font-extrabold text-lg shadow-soft transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Square className="w-6 h-6 fill-white" />
            END TRIP
          </button>
        )}
      </div>

      {/* Speedometer & Passengers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-clean p-5 text-center">
          <Gauge className="w-5 h-5 text-emeraldPrimary mx-auto mb-1" />
          <span className="text-xs text-mutedGray block">Live Speed</span>
          <span className="text-3xl font-extrabold text-charcoal font-heading">{coords.speed}</span>
          <span className="text-[10px] text-mutedGray block">km/h</span>
        </div>

        <div className="card-clean p-5 text-center">
          <Users className="w-5 h-5 text-emeraldPrimary mx-auto mb-1" />
          <span className="text-xs text-mutedGray block">Passengers</span>
          <div className="flex items-center justify-center gap-3 mt-1">
            <button
              onClick={() => setPassengerCount(Math.max(0, passengerCount - 1))}
              className="w-7 h-7 rounded-lg bg-warmBg border border-borderLight font-bold text-charcoal hover:bg-sageSoft"
            >
              -
            </button>
            <span className="text-lg font-bold text-charcoal">{passengerCount}</span>
            <button
              onClick={() => setPassengerCount(passengerCount + 1)}
              className="w-7 h-7 rounded-lg bg-warmBg border border-borderLight font-bold text-charcoal hover:bg-sageSoft"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry data */}
      <div className="card-clean p-4 text-xs space-y-2">
        <div className="flex justify-between text-mutedGray">
          <span>Active Route</span>
          <span className="text-emeraldPrimary font-bold">Route 101 (Mangaluru → Udupi)</span>
        </div>
        <div className="flex justify-between text-mutedGray">
          <span>Latitude</span>
          <span className="font-mono text-charcoal">{coords.lat.toFixed(6)}</span>
        </div>
        <div className="flex justify-between text-mutedGray">
          <span>Longitude</span>
          <span className="font-mono text-charcoal">{coords.lng.toFixed(6)}</span>
        </div>
      </div>
    </div>
  );
}
