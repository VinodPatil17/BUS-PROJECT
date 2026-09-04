import React from 'react';
import { Bus, ShieldCheck, Radio, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-warmBg text-charcoal py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      <div className="card-clean p-8 sm:p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emeraldPrimary text-white flex items-center justify-center mx-auto shadow-md">
          <Bus className="w-8 h-8" />
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-charcoal">About Track My Bus</h1>
        <p className="text-base text-mutedGray max-w-2xl mx-auto leading-relaxed">
          Track My Bus is a commercial-grade, real-time transportation platform designed to deliver precise mobile GPS tracking, intelligent arrival ETAs, and clean route management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-clean p-6 space-y-3">
          <div className="p-3 rounded-xl bg-sageSoft text-emeraldPrimary w-fit font-bold">
            <Radio className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-charcoal">Sub-Second Mobile Telemetry</h3>
          <p className="text-xs text-mutedGray leading-relaxed">
            Utilizes browser Geolocation APIs directly on smartphones to broadcast live latitude, longitude, and speed coordinates via Socket.IO without page refreshes.
          </p>
        </div>

        <div className="card-clean p-6 space-y-3">
          <div className="p-3 rounded-xl bg-sageSoft text-emeraldPrimary w-fit font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-charcoal">Smart Departure Advisor</h3>
          <p className="text-xs text-mutedGray leading-relaxed">
            Calculates personalized departure recommendations combining bus arrival ETA, student walking times, and safety buffers.
          </p>
        </div>
      </div>
    </div>
  );
}
