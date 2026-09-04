import React from 'react';
import { Bus, ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-borderLight py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emeraldPrimary flex items-center justify-center text-white shadow-sm">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-charcoal text-base">Track My Bus</div>
              <p className="text-xs text-mutedGray">Real-Time Bus Tracking & Route Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-mutedGray">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-statusLive" />
              <span>Real-Time Telemetry</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emeraldPrimary" />
              <span>Smart ETA Engine</span>
            </div>
          </div>

          <div className="text-xs text-mutedGray">
            &copy; {new Date().getFullYear()} Track My Bus. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
