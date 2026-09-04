import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import FromToSearch from '../components/Search/FromToSearch';
import BusTimingsCard from '../components/Search/BusTimingsCard';
import { Route as RouteIcon, Bus, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function RoutesPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const navigate = useNavigate();

  const [fromLoc, setFromLoc] = useState(initialSearch || 'Mangaluru');
  const [toLoc, setToLoc] = useState('Udupi');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/routes');
      setRoutes(res.data.routes || []);
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = ({ from, to }) => {
    setFromLoc(from);
    setToLoc(to);
  };

  const filteredRoutes = routes.filter(r => {
    const text = `${r.name} ${r.code} ${r.start_location} ${r.end_location}`.toLowerCase();
    const matchesFrom = !fromLoc || text.includes(fromLoc.toLowerCase());
    const matchesTo = !toLoc || text.includes(toLoc.toLowerCase());
    return matchesFrom && matchesTo;
  });

  const displayRoutes = filteredRoutes.length > 0 ? filteredRoutes : routes;

  return (
    <div className="min-h-screen bg-warmBg text-charcoal py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Page Header & FROM -> TO Search Component */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="font-heading font-extrabold text-3xl text-charcoal">Public Transport Route Finder</h1>
          <p className="text-sm text-mutedGray mt-1">Search live buses, arrival timings, and stop schedules</p>
        </div>

        <FromToSearch
          onSearch={handleSearchSubmit}
          initialFrom={fromLoc}
          initialTo={toLoc}
        />
      </div>

      {/* Available Bus Timings */}
      <BusTimingsCard
        onSelectBus={(b) => navigate('/student')}
      />

      {/* Search Results / Route Cards */}
      <div className="space-y-4">
        <h2 className="font-heading font-extrabold text-xl text-charcoal flex items-center gap-2">
          <RouteIcon className="w-5 h-5 text-emeraldPrimary" />
          Matching Bus Routes ({displayRoutes.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayRoutes.map((r) => (
            <div key={r.id} className="card-interactive p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emeraldPrimary bg-sageSoft px-3 py-1 rounded-full">
                    {r.code}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-statusLive">
                    <span className="w-2 h-2 rounded-full bg-statusLive animate-pulse"></span>
                    ● 3 buses available
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-extrabold text-xl text-charcoal">{r.name}</h3>
                  <div className="text-xs font-bold text-emeraldDark mt-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emeraldPrimary" />
                    {r.start_location} → {r.end_location}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-borderLight grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-warmBg p-2.5 rounded-xl border border-borderLight">
                  <span className="text-mutedGray block text-[10px]">Next Bus</span>
                  <span className="font-bold text-emeraldPrimary">08 min</span>
                </div>

                <div className="bg-warmBg p-2.5 rounded-xl border border-borderLight">
                  <span className="text-mutedGray block text-[10px]">Travel Time</span>
                  <span className="font-bold text-charcoal">58 min</span>
                </div>

                <div className="bg-warmBg p-2.5 rounded-xl border border-borderLight">
                  <span className="text-mutedGray block text-[10px]">Stops</span>
                  <span className="font-bold text-charcoal">24</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/student"
                  className="py-2.5 rounded-xl bg-warmBg hover:bg-sageSoft text-emeraldPrimary border border-borderLight text-xs font-bold transition text-center"
                >
                  View Route
                </Link>
                <Link
                  to="/student"
                  className="py-2.5 rounded-xl bg-emeraldPrimary hover:bg-emeraldDark text-white text-xs font-bold transition text-center flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Track Bus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
