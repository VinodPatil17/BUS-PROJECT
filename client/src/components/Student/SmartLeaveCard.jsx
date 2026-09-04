import React, { useState } from 'react';
import { Clock, Footprints, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

export default function SmartLeaveCard({ busEtaMinutes = 8, selectedStopName = 'Kottara Chowki' }) {
  const [walkingTime, setWalkingTime] = useState(6);
  const [bufferTime, setBufferTime] = useState(2);

  const totalRequired = walkingTime + bufferTime;
  const leaveIn = busEtaMinutes - totalRequired;

  const now = new Date();
  const arrivalTime = new Date(now.getTime() + busEtaMinutes * 60000);
  const formattedArrivalTime = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let badgeBg = 'bg-sageSoft text-emeraldDark';
  let badgeText = 'RELAXED';
  if (leaveIn <= 1) {
    badgeBg = 'bg-red-50 text-statusError border border-statusError/30 animate-pulse';
    badgeText = 'LEAVE NOW';
  } else if (leaveIn <= 3) {
    badgeBg = 'bg-amber-50 text-statusWarning border border-statusWarning/30';
    badgeText = 'PREPARE';
  }

  return (
    <div className="card-sage p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-white text-emeraldPrimary border border-borderLight shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-charcoal text-base">Smart "When Should I Leave?"</h3>
            <p className="text-xs text-mutedGray">Personalized Departure Recommendation</p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-bold ${badgeBg}`}>
          {badgeText}
        </div>
      </div>

      {/* Main Countdown Display */}
      <div className="bg-white rounded-2xl p-5 border border-borderLight my-4 text-center shadow-sm">
        <div className="text-xs font-semibold text-mutedGray uppercase tracking-wider">Recommended Departure</div>
        <div className="text-3xl sm:text-4xl font-extrabold text-charcoal font-heading mt-1 flex items-center justify-center gap-2">
          <Footprints className="w-7 h-7 text-emeraldPrimary" />
          {leaveIn > 0 ? (
            <span>Leave in <span className="text-emeraldPrimary">{leaveIn} minutes</span></span>
          ) : (
            <span className="text-statusError">Leave Immediately!</span>
          )}
        </div>
        <p className="text-xs text-mutedGray mt-2">
          Your bus arrives around <span className="font-bold text-charcoal">{formattedArrivalTime}</span> at <span className="text-emeraldPrimary font-bold">{selectedStopName}</span>.
        </p>
      </div>

      {/* Formula inputs & info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-3 rounded-xl border border-borderLight">
          <span className="text-mutedGray block mb-1">Bus ETA</span>
          <span className="text-sm font-bold text-charcoal flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emeraldPrimary" />
            {busEtaMinutes} mins
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-borderLight">
          <span className="text-mutedGray block mb-1">Walking Time</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="2"
              max="15"
              value={walkingTime}
              onChange={(e) => setWalkingTime(parseInt(e.target.value))}
              className="w-16 accent-emeraldPrimary cursor-pointer"
            />
            <span className="text-sm font-bold text-charcoal">{walkingTime} mins</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-borderLight">
          <span className="text-mutedGray block mb-1">Safety Buffer</span>
          <span className="text-sm font-bold text-charcoal flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-statusWarning" />
            +{bufferTime} mins
          </span>
        </div>
      </div>
    </div>
  );
}
