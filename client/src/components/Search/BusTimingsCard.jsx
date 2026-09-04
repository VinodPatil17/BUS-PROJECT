import React from 'react';
import { Bus, Clock, Radio, CheckCircle2 } from 'lucide-react';

export default function BusTimingsCard({ buses = [], onSelectBus }) {
  const defaultTimings = [
    { busNumber: 'Bus 101', regNumber: 'KA 19 AB 1234', time: '08:10 AM', status: 'LIVE', etaMin: 8 },
    { busNumber: 'Bus 102', regNumber: 'KA 19 AB 5678', time: '08:25 AM', status: 'LIVE', etaMin: 22 },
    { busNumber: 'Bus 103', regNumber: 'KA 19 AB 9012', time: '08:45 AM', status: 'SCHEDULED', etaMin: 40 }
  ];

  const busList = buses.length > 0 ? buses : defaultTimings;

  return (
    <div className="card-clean p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-borderLight pb-3">
        <h3 className="font-heading font-bold text-charcoal text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-emeraldPrimary" />
          AVAILABLE BUS TIMINGS
        </h3>
        <span className="text-xs text-mutedGray">{busList.length} Buses Scheduled</span>
      </div>

      <div className="space-y-3">
        {busList.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectBus && onSelectBus(item)}
            className="p-4 rounded-xl bg-warmBg border border-borderLight flex items-center justify-between hover:border-emeraldPrimary transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-emeraldPrimary flex items-center justify-center font-bold border border-borderLight shadow-sm">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-charcoal flex items-center gap-2">
                  {item.busNumber || `Bus 10${idx + 1}`}
                  <span className="text-xs font-mono text-mutedGray font-normal">({item.regNumber || 'KA 19 AB 1234'})</span>
                </div>
                <div className="text-xs text-mutedGray mt-0.5">
                  Departure Time: <span className="font-bold text-charcoal">{item.time || '08:10 AM'}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              {item.status === 'LIVE' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sageSoft text-emeraldDark border border-sageSoft inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-statusLive animate-pulse"></span>
                  LIVE
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-warmBg text-mutedGray border border-borderLight">
                  SCHEDULED
                </span>
              )}
              <div className="text-xs font-bold text-emeraldPrimary mt-1">
                ETA {item.etaMin || 8} min
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
