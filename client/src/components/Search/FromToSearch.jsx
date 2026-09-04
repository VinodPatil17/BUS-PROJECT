import React, { useState } from 'react';
import { MapPin, ArrowRightLeft, Navigation, Search, Locate, AlertCircle } from 'lucide-react';

export default function FromToSearch({
  onSearch,
  onUseCurrentLocation,
  userLocation,
  initialFrom = '',
  initialTo = ''
}) {
  const [fromLocation, setFromLocation] = useState(initialFrom);
  const [toLocation, setToLocation] = useState(initialTo);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleCurrentLocationClick = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation API is not supported on this browser.');
      return;
    }

    setLocating(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setFromLocation('Current Location (Near Kottara)');
        if (onUseCurrentLocation) {
          onUseCurrentLocation({
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy),
            address: 'Your Current Location'
          });
        }
      },
      (err) => {
        setLocating(false);
        setGeoError('Location permission was denied. Please allow location access to track your current position.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ from: fromLocation, to: toLocation });
    }
  };

  return (
    <div className="card-clean p-6 sm:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-borderLight">
        <div>
          <h2 className="font-heading font-extrabold text-xl text-charcoal flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emeraldPrimary" />
            Route & Bus Search
          </h2>
          <p className="text-xs text-mutedGray">Search buses between your origin and destination stops</p>
        </div>

        <button
          type="button"
          onClick={handleCurrentLocationClick}
          className="flex items-center gap-2 bg-sageSoft hover:bg-emeraldPrimary hover:text-white text-emeraldDark px-4 py-2 rounded-xl text-xs font-bold transition border border-sageSoft shadow-sm"
        >
          <Locate className="w-4 h-4 text-emeraldPrimary" />
          {locating ? 'Locating...' : 'Use My Current Location'}
        </button>
      </div>

      {geoError && (
        <div className="bg-red-50 border border-statusError/30 p-3 rounded-xl text-xs text-statusError flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* FROM Input */}
          <div className="md:col-span-5 relative">
            <label className="text-[11px] font-bold text-mutedGray block mb-1 uppercase tracking-wider">
              FROM
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emeraldPrimary absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Enter starting location"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full bg-warmBg border border-borderLight pl-10 pr-4 py-3 rounded-xl text-xs text-charcoal outline-none focus:border-emeraldPrimary transition"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center md:pt-5">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3 rounded-xl bg-warmBg hover:bg-sageSoft text-emeraldPrimary border border-borderLight transition shadow-sm"
              title="Swap Locations"
            >
              <ArrowRightLeft className="w-4 h-4 rotate-90 md:rotate-0" />
            </button>
          </div>

          {/* TO Input */}
          <div className="md:col-span-5 relative">
            <label className="text-[11px] font-bold text-mutedGray block mb-1 uppercase tracking-wider">
              TO
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-statusWarning absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Enter destination"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full bg-warmBg border border-borderLight pl-10 pr-4 py-3 rounded-xl text-xs text-charcoal outline-none focus:border-emeraldPrimary transition"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-emeraldPrimary hover:bg-emeraldDark text-white font-heading font-extrabold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search Buses
        </button>
      </form>
    </div>
  );
}
