import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Bus, Search, Bell, LogOut, User, Navigation, ChevronDown } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/routes?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Live Tracking', path: user?.role === 'driver' ? '/driver' : user?.role === 'admin' ? '/admin' : '/student' },
    { label: 'Routes', path: '/routes' },
    { label: 'Stops', path: '/stops' },
    { label: 'About', path: '/about' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-borderLight shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 py-3">
        
        {/* Left: Logo + Product Name */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emeraldPrimary flex items-center justify-center shadow-md group-hover:bg-emeraldDark transition-colors">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-xl tracking-tight text-charcoal flex items-center gap-1.5">
              Track My Bus
            </div>
            <span className="text-[10px] text-mutedGray uppercase tracking-wider font-semibold block -mt-1">
              Live Transit Platform
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`text-sm font-semibold transition py-1.5 relative ${
                  isActive
                    ? 'text-emeraldPrimary font-bold'
                    : 'text-mutedGray hover:text-charcoal'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emeraldPrimary rounded-full"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search Box + Notifications + Profile */}
        <div className="flex items-center gap-3">
          
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:block relative w-56">
            <Search className="w-4 h-4 text-mutedGray absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search bus, route or stop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-warmBg border border-borderLight pl-9 pr-3 py-1.5 rounded-xl text-xs text-charcoal placeholder-mutedGray outline-none focus:border-emeraldPrimary focus:bg-white transition"
            />
          </form>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-warmBg hover:bg-sageSoft/40 text-charcoal border border-borderLight transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-mutedGray" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emeraldPrimary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationCenter onClose={() => setShowNotifications(false)} />
            )}
          </div>

          {/* User Profile / Login */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-borderLight">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-charcoal">{user.name || 'Vinod Patil'}</div>
                <div className="text-[10px] text-emeraldPrimary font-semibold capitalize">{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-warmBg hover:bg-red-50 text-statusError border border-borderLight transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-emeraldPrimary hover:bg-emeraldDark text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
