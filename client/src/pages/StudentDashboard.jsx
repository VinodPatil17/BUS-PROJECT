import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import MapView from '../components/Map/MapView';
import FromToSearch from '../components/Search/FromToSearch';
import BusTimingsCard from '../components/Search/BusTimingsCard';
import SmartLeaveCard from '../components/Student/SmartLeaveCard';
import RouteProgress from '../components/Student/RouteProgress';
import { Bus, Clock, MapPin, Gauge, Compass, Bell, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { liveBusData } = useSocket();

  const [busData, setBusData] = useState(null);
  const [stops, setStops] = useState([]);
  const [targetStopId, setTargetStopId] = useState(7); // Default Udupi Terminal
  const [userLocation, setUserLocation] = useState(null);

  // Search state
  const [searchFrom, setSearchFrom] = useState('Kottara');
  const [searchTo, setSearchTo] = useState('Udupi');

  // Destination alert notification state
  const [destinationNotification, setDestinationNotification] = useState(null);

  const busId = 1;

  useEffect(() => {
    fetchBusDetails();
  }, []);

  const fetchBusDetails = async () => {
    try {
      const res = await api.get(`/buses/${busId}`);
      setBusData(res.data.bus);
      setStops(res.data.stops || []);
    } catch (err) {
      console.error('Failed to fetch bus details:', err);
    }
  };

  const socketUpdate = liveBusData[busId];
  const currentLat = socketUpdate?.lat || busData?.current_lat || 12.8988;
  const currentLng = socketUpdate?.lng || busData?.current_lng || 74.8456;
  const currentSpeed = socketUpdate?.speed ?? busData?.current_speed ?? 32;

  const routeAnalysis = socketUpdate?.routeAnalysis || {
    currentStop: { name: 'Kottara', id: 2 },
    nextStop: { name: 'Kottara Chowki', id: 3 },
    nextStopEtaMinutes: 8,
    nextStopDistanceKm: 2.4,
    completedStops: stops.slice(0, 2)
  };

  const targetStop = stops.find(s => s.id === parseInt(targetStopId)) || stops[6] || { name: 'Udupi Terminal', id: 7 };

  const currentStopName = routeAnalysis.currentStop?.name || 'Kottara';
  const nextStopName = routeAnalysis.nextStop?.name || 'Kottara Chowki';
  const etaMinutes = routeAnalysis.nextStopEtaMinutes || 8;

  // Proximity Alert listener
  useEffect(() => {
    if (socketUpdate?.targetProximity?.message) {
      setDestinationNotification(socketUpdate.targetProximity.message);
    }
  }, [socketUpdate]);

  const handleSearchSubmit = ({ from, to }) => {
    setSearchFrom(from);
    setSearchTo(to);
    // Find stop matching TO destination
    const matchedStop = stops.find(s => s.name.toLowerCase().includes(to.toLowerCase()));
    if (matchedStop) {
      setTargetStopId(matchedStop.id);
    }
  };

  return (
    <div className="min-h-screen bg-warmBg text-charcoal py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Target Destination Alert Notification Toast */}
      {destinationNotification && (
        <div className="bg-sageSoft border border-emeraldPrimary/30 p-4 rounded-2xl flex items-center justify-between shadow-soft animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white text-emeraldPrimary shadow-sm">
              <Bell className="w-5 h-5 text-emeraldPrimary" />
            </div>
            <div>
              <div className="text-xs font-bold text-emeraldDark uppercase tracking-wider">Destination Proximity Notification</div>
              <div className="text-sm font-extrabold text-charcoal">{destinationNotification}</div>
            </div>
          </div>

          <button
            onClick={() => setDestinationNotification(null)}
            className="text-xs font-bold text-mutedGray hover:text-charcoal px-3 py-1 bg-white rounded-lg border border-borderLight"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Header Welcome */}
      <div className="card-clean p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal">
              GOOD MORNING, Vinod Patil 👋
            </h1>
            <span className="flex items-center gap-1.5 bg-sageSoft text-emeraldDark text-xs px-3 py-1 rounded-full font-bold">
              <span className="w-2 h-2 rounded-full bg-statusLive animate-pulse"></span>
              ● LIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-mutedGray">
            Route 101: <span className="text-emeraldPrimary font-bold">Mangaluru → Udupi</span> • Active Bus: <span className="font-bold text-charcoal">KA 19 AB 1234</span>
          </p>
        </div>

        {/* Target Stop Destination Selector */}
        <div className="flex items-center gap-3 bg-warmBg p-3 rounded-2xl border border-borderLight">
          <MapPin className="w-5 h-5 text-statusWarning" />
          <div>
            <span className="text-[10px] text-mutedGray block font-bold uppercase tracking-wider">🎯 Your Target Destination</span>
            <select
              value={targetStopId}
              onChange={(e) => setTargetStopId(e.target.value)}
              className="bg-transparent text-xs font-bold text-statusWarning outline-none cursor-pointer"
            >
              {stops.map(s => (
                <option key={s.id} value={s.id} className="bg-white text-charcoal">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. FROM → TO Route Search Section */}
      <FromToSearch
        onSearch={handleSearchSubmit}
        onUseCurrentLocation={(loc) => setUserLocation(loc)}
        userLocation={userLocation}
        initialFrom={searchFrom}
        initialTo={searchTo}
      />

      {/* 3. Main Live Map Section with User Location & Target Stop Pins */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-xl text-charcoal flex items-center gap-2">
            <Bus className="w-5 h-5 text-emeraldPrimary" />
            Live Navigation & Bus Tracking Map
          </h2>
          <span className="text-xs text-mutedGray hidden sm:inline">User Location & Bus Location strictly separated</span>
        </div>

        <MapView
          busLocation={{
            lat: currentLat,
            lng: currentLng,
            speed: currentSpeed,
            busNumber: '101',
            regNumber: 'KA 19 AB 1234',
            routeAnalysis
          }}
          stops={stops}
          userLocation={userLocation}
          targetStop={targetStop}
        />
      </div>

      {/* 4. Bus Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="card-clean p-5">
          <span className="text-xs text-mutedGray block mb-1">Selected Bus</span>
          <div className="font-extrabold text-charcoal text-base">KA 19 AB 1234</div>
          <div className="text-xs text-emeraldPrimary font-bold mt-0.5">Route 101: Mangaluru → Udupi</div>
        </div>

        <div className="card-clean p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-mutedGray">Bus Current Location</span>
            <span className="text-[10px] bg-sageSoft text-emeraldDark px-2 py-0.5 rounded-full font-bold">● LIVE</span>
          </div>
          <div className="font-extrabold text-charcoal text-base flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emeraldPrimary" />
            {currentStopName}
          </div>
          <div className="text-xs text-mutedGray mt-0.5">Next Stop: <span className="font-bold text-statusWarning">{nextStopName}</span></div>
        </div>

        <div className="card-clean p-5">
          <span className="text-xs text-mutedGray block mb-1">Target Destination</span>
          <div className="font-extrabold text-statusWarning text-base flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-statusWarning" />
            {targetStop.name}
          </div>
          <div className="text-xs text-mutedGray mt-0.5">Speed: {currentSpeed} km/h</div>
        </div>

        <div className="card-clean p-5">
          <span className="text-xs text-mutedGray block mb-1">ETA to Target Destination</span>
          <div className="font-extrabold text-emeraldPrimary text-xl flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-emeraldPrimary" />
            58 min
          </div>
          <div className="text-xs text-mutedGray mt-0.5">Stops Remaining: 5</div>
        </div>
      </div>

      {/* 5. Bus Timings, Smart Leave & Route Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BusTimingsCard />
          <SmartLeaveCard
            busEtaMinutes={etaMinutes}
            selectedStopName={targetStop.name}
          />
        </div>

        <div className="lg:col-span-1">
          <RouteProgress
            stops={stops}
            currentStopIndex={2}
            targetStopId={targetStopId}
          />
        </div>
      </div>
    </div>
  );
}
