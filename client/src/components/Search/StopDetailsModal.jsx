import React from 'react';
import { MapPin, Bus, Clock, Route as RouteIcon, X, ArrowRight } from 'lucide-react';

export default function StopDetailsModal({ stop, onClose, onTrackBus }) {
  if (!stop) return null;

  return (
    <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-borderLight p-6 rounded-3xl w-full max-w-md space-y-5 shadow-soft-lg">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-borderLight">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sageSoft text-emeraldPrimary flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-charcoal">{stop.name}</h3>
              <span className="text-xs text-mutedGray">Stop #{stop.sequence_order || 3} • Sequence Stop</span>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-mutedGray hover:text-charcoal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Passing Routes */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-mutedGray uppercase tracking-wider block">
            Routes Serving This Stop
          </span>
          <div className="flex flex-wrap gap-2">
            {['101', '102', '104'].map((r) => (
              <span key={r} className="bg-sageSoft text-emeraldDark text-xs font-bold px-3 py-1 rounded-full border border-sageSoft flex items-center gap-1">
                <RouteIcon className="w-3.5 h-3.5" />
                Route {r}
              </span>
            ))}
          </div>
        </div>

        {/* Next Arriving Bus */}
        <div className="bg-warmBg p-4 rounded-2xl border border-borderLight space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-mutedGray">Next Arriving Bus:</span>
            <span className="font-bold text-statusLive bg-sageSoft px-2.5 py-0.5 rounded-full">
              ● LIVE
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-emeraldPrimary" />
              <div>
                <div className="text-sm font-extrabold text-charcoal">KA 19 AB 1234</div>
                <div className="text-[11px] text-mutedGray">Bus 101 • Mangaluru → Udupi</div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-mutedGray block">ETA</span>
              <span className="text-base font-extrabold text-emeraldPrimary flex items-center gap-1">
                <Clock className="w-4 h-4" />
                06 min
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            if (onTrackBus) onTrackBus(stop);
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-emeraldPrimary hover:bg-emeraldDark text-white font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2"
        >
          <span>Track Live Bus at {stop.name}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
