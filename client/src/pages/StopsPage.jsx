import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Bus, Clock, Route as RouteIcon, Search, ArrowRight } from 'lucide-react';

export default function StopsPage() {
  const [stops, setStops] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStops();
  }, []);

  const fetchStops = async () => {
    try {
      const res = await api.get('/routes/1');
      setStops(res.data.route?.stops || []);
    } catch (err) {
      console.error('Failed to fetch stops:', err);
    }
  };

  const filteredStops = stops.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-warmBg text-charcoal py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="card-clean p-8 text-center max-w-3xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sageSoft text-emeraldPrimary flex items-center justify-center mx-auto">
          <MapPin className="w-6 h-6" />
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-charcoal">Bus Stops Information Panel</h1>
        <p className="text-sm text-mutedGray max-w-xl mx-auto">
          View passing routes, next arriving buses, live ETAs, and stop coordinates.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-4 h-4 text-mutedGray absolute left-4 top-5" />
          <input
            type="text"
            placeholder="Search stop name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-borderLight pl-11 pr-4 py-3 rounded-2xl text-xs text-charcoal outline-none focus:border-emeraldPrimary shadow-sm"
          />
        </div>
      </div>

      {/* Stops List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStops.map((stop) => (
          <div key={stop.id} className="card-clean p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sageSoft text-emeraldPrimary font-bold text-sm flex items-center justify-center">
                  #{stop.sequence_order}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-charcoal">{stop.name}</h3>
                  <span className="text-xs text-mutedGray">Sequence Stop {stop.sequence_order}</span>
                </div>
              </div>

              <span className="text-xs font-bold text-statusLive bg-sageSoft px-3 py-1 rounded-full">
                ● Live Stop
              </span>
            </div>

            <div className="bg-warmBg p-4 rounded-xl border border-borderLight space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-mutedGray">Next Arriving Bus:</span>
                <span className="font-bold text-emeraldPrimary">KA 19 AB 1234 (Bus 101)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedGray">Estimated Arrival:</span>
                <span className="font-bold text-charcoal">08 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedGray">Routes Serving Stop:</span>
                <span className="font-semibold text-charcoal">Route 101 (Mangaluru → Udupi)</span>
              </div>
            </div>

            <Link
              to="/student"
              className="w-full py-2.5 rounded-xl bg-white hover:bg-sageSoft/40 text-emeraldPrimary border border-borderLight text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Track Live Bus at {stop.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
