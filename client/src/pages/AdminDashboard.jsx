import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import MapView from '../components/Map/MapView';
import { Bus, Users, Route as RouteIcon, Shield, Sparkles, Plus, Trash2, Radio } from 'lucide-react';

export default function AdminDashboard() {
  const { liveBusData } = useSocket();

  const [activeTab, setActiveTab] = useState('overview');
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [newBusNumber, setNewBusNumber] = useState('');
  const [newRegNumber, setNewRegNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState(50);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [busRes, routeRes, tripRes] = await Promise.all([
        api.get('/buses'),
        api.get('/routes'),
        api.get('/trips')
      ]);

      setBuses(busRes.data.buses || []);
      setRoutes(routeRes.data.routes || []);
      setTrips(tripRes.data.trips || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      await api.post('/buses', {
        busNumber: newBusNumber,
        regNumber: newRegNumber,
        capacity: newCapacity,
        routeId: 1
      });
      setShowAddBusModal(false);
      setNewBusNumber('');
      setNewRegNumber('');
      fetchAdminData();
    } catch (err) {
      console.error('Failed to add bus:', err);
    }
  };

  const handleDeleteBus = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await api.delete(`/buses/${id}`);
        fetchAdminData();
      } catch (err) {
        console.error('Failed to delete bus:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-warmBg text-charcoal py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="card-clean p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emeraldPrimary text-white flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-charcoal">Fleet Admin Control</h1>
            <p className="text-xs text-mutedGray">Real-time Operations & Multi-Bus Management</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-warmBg p-1.5 rounded-2xl border border-borderLight overflow-x-auto">
          {[
            { id: 'overview', label: 'Fleet Map' },
            { id: 'buses', label: 'Buses' },
            { id: 'routes', label: 'Routes' },
            { id: 'history', label: 'Trip Logs' },
            { id: 'ai', label: 'AI Insights' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emeraldPrimary text-white shadow-sm'
                  : 'text-mutedGray hover:text-charcoal hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card-clean p-5">
          <span className="text-xs text-mutedGray block mb-1">TOTAL BUSES</span>
          <span className="text-2xl font-extrabold text-charcoal font-heading">12</span>
        </div>
        <div className="card-clean p-5">
          <span className="text-xs text-mutedGray block mb-1">ACTIVE BUSES</span>
          <span className="text-2xl font-extrabold text-statusLive font-heading">7</span>
        </div>
        <div className="card-clean p-5">
          <span className="text-xs text-mutedGray block mb-1">ACTIVE DRIVERS</span>
          <span className="text-2xl font-extrabold text-emeraldPrimary font-heading">7</span>
        </div>
        <div className="card-clean p-5">
          <span className="text-xs text-mutedGray block mb-1">STUDENTS RIDING</span>
          <span className="text-2xl font-extrabold text-charcoal font-heading">284</span>
        </div>
        <div className="card-clean p-5 col-span-2 lg:col-span-1">
          <span className="text-xs text-mutedGray block mb-1">ONGOING TRIPS</span>
          <span className="text-2xl font-extrabold text-statusWarning font-heading">7</span>
        </div>
      </div>

      {/* TAB 1: FLEET MAP */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-charcoal flex items-center gap-2">
              <Radio className="w-4 h-4 text-statusLive animate-pulse" />
              Live Fleet Tracking Map
            </h2>
            <span className="text-xs text-mutedGray">Simultaneous multi-bus monitoring</span>
          </div>

          <MapView
            busLocation={{
              lat: liveBusData[1]?.lat || 12.8988,
              lng: liveBusData[1]?.lng || 74.8456,
              speed: liveBusData[1]?.speed || 32,
              busNumber: '101'
            }}
            stops={routes[0]?.stops || []}
          />
        </div>
      )}

      {/* TAB 2: BUSES */}
      {activeTab === 'buses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-charcoal">Fleet Vehicle Registry</h2>
            <button
              onClick={() => setShowAddBusModal(true)}
              className="bg-emeraldPrimary hover:bg-emeraldDark text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Bus
            </button>
          </div>

          <div className="card-clean overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-warmBg text-mutedGray border-b border-borderLight font-semibold uppercase">
                <tr>
                  <th className="p-4">Bus Number</th>
                  <th className="p-4">Registration</th>
                  <th className="p-4">Capacity</th>
                  <th className="p-4">Driver</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight">
                {buses.map((b) => (
                  <tr key={b.id} className="hover:bg-warmBg/50 transition">
                    <td className="p-4 font-bold text-charcoal flex items-center gap-2">
                      <Bus className="w-4 h-4 text-emeraldPrimary" />
                      {b.bus_number}
                    </td>
                    <td className="p-4 font-mono text-mutedGray">{b.reg_number}</td>
                    <td className="p-4 text-charcoal">{b.capacity} Seats</td>
                    <td className="p-4 text-emeraldPrimary font-semibold">{b.driver_name || 'Rajesh Kumar'}</td>
                    <td className="p-4 text-charcoal">{b.route_name || 'Route 101 (Mangaluru → Udupi)'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${b.status === 'active' ? 'bg-sageSoft text-emeraldDark' : 'bg-warmBg text-mutedGray'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteBus(b.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-statusError rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ROUTES */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-xl text-charcoal">Active Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routes.map(r => (
              <div key={r.id} className="card-clean p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-charcoal text-base">{r.name}</h3>
                  <span className="text-xs font-bold text-emeraldPrimary bg-sageSoft px-2.5 py-1 rounded-full">
                    {r.code}
                  </span>
                </div>
                <div className="text-xs text-mutedGray">
                  Distance: <span className="font-bold text-charcoal">{r.total_distance_km} km</span> • Stops: <span className="font-bold text-charcoal">{r.stops?.length || 7}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showAddBusModal && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-borderLight p-6 rounded-3xl w-full max-w-md space-y-4 shadow-soft-lg">
            <h3 className="font-heading font-bold text-lg text-charcoal">Add New Bus to Fleet</h3>
            <form onSubmit={handleAddBus} className="space-y-4 text-xs">
              <div>
                <label className="text-mutedGray block mb-1">Bus Number (e.g. Bus 104)</label>
                <input
                  type="text"
                  required
                  value={newBusNumber}
                  onChange={(e) => setNewBusNumber(e.target.value)}
                  className="w-full bg-warmBg border border-borderLight p-3 rounded-xl text-charcoal outline-none focus:border-emeraldPrimary"
                />
              </div>

              <div>
                <label className="text-mutedGray block mb-1">Registration Number</label>
                <input
                  type="text"
                  required
                  value={newRegNumber}
                  onChange={(e) => setNewRegNumber(e.target.value)}
                  className="w-full bg-warmBg border border-borderLight p-3 rounded-xl text-charcoal outline-none focus:border-emeraldPrimary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBusModal(false)}
                  className="w-1/2 py-3 rounded-xl bg-warmBg text-mutedGray font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-xl bg-emeraldPrimary text-white font-bold"
                >
                  Save Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
