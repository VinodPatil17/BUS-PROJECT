import React from 'react';
import { Check, Target, Bus } from 'lucide-react';

export default function RouteProgress({ stops = [], currentStopIndex = 2, targetStopId }) {
  if (!stops || stops.length === 0) return null;

  const totalStops = stops.length;
  const completedCount = Math.min(currentStopIndex, totalStops);
  const progressPercent = Math.min(100, Math.round((completedCount / totalStops) * 100));

  return (
    <div className="card-clean p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-borderLight pb-3">
        <h3 className="font-heading font-bold text-charcoal text-base">Route Progress Stepper</h3>
        <span className="text-xs font-bold text-emeraldPrimary bg-sageSoft px-3 py-1 rounded-full">
          {progressPercent}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-warmBg rounded-full h-2.5 p-0.5 border border-borderLight overflow-hidden">
        <div
          className="bg-emeraldPrimary h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="text-xs text-mutedGray flex justify-between">
        <span>{completedCount} of {totalStops} stops completed</span>
        <span>{totalStops - completedCount} remaining</span>
      </div>

      {/* Route Stepper */}
      <div className="space-y-4 relative pl-5 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-borderLight pt-2">
        {stops.map((stop, idx) => {
          const isCompleted = idx < currentStopIndex;
          const isCurrent = idx === currentStopIndex;
          const isTarget = targetStopId && (stop.id === targetStopId || stop.id === parseInt(targetStopId));
          const isNext = idx === currentStopIndex + 1;

          return (
            <div key={stop.id || idx} className="flex items-center gap-3 relative z-10">
              {/* Icon Status */}
              {isTarget ? (
                <div className="w-6 h-6 rounded-full bg-statusWarning text-white flex items-center justify-center text-xs font-bold shadow-sm animate-bounce">
                  🎯
                </div>
              ) : isCompleted ? (
                <div className="w-6 h-6 rounded-full bg-emeraldPrimary text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : isCurrent ? (
                <div className="w-6 h-6 rounded-full bg-statusLive text-white flex items-center justify-center text-xs font-bold shadow-sm animate-pulse">
                  🚌
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-warmBg text-upcomingGray border border-borderLight flex items-center justify-center text-xs font-bold">
                  ○
                </div>
              )}

              <div className="flex-1 flex items-center justify-between">
                <div>
                  <span
                    className={`text-xs font-semibold ${
                      isTarget
                        ? 'text-statusWarning font-extrabold text-sm'
                        : isCurrent
                        ? 'text-statusLive font-extrabold text-sm'
                        : isCompleted
                        ? 'text-mutedGray line-through'
                        : 'text-charcoal'
                    }`}
                  >
                    {stop.name}
                  </span>
                  
                  {isCurrent && !isTarget && (
                    <span className="ml-2 text-[10px] bg-sageSoft text-emeraldDark px-2 py-0.5 rounded-full font-bold">
                      CURRENT BUS STOP
                    </span>
                  )}
                  {isTarget && (
                    <span className="ml-2 text-[10px] bg-amber-50 text-statusWarning px-2 py-0.5 rounded-full font-bold border border-statusWarning/30">
                      🎯 YOUR DESTINATION
                    </span>
                  )}
                  {isNext && !isTarget && (
                    <span className="ml-2 text-[10px] bg-warmBg text-mutedGray px-2 py-0.5 rounded-full font-semibold border border-borderLight">
                      NEXT STOP
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-mutedGray font-mono">
                  +{stop.est_minutes_from_start}m
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
