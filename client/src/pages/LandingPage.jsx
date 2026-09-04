import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, Navigation, Clock, Shield, Sparkles, Smartphone, ArrowRight, Radio, MapPin, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const { quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleQuickRoleLaunch = async (role) => {
    try {
      await quickDemoLogin(role);
      navigate(`/${role}`);
    } catch (err) {
      console.error('Demo login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-warmBg text-charcoal">
      
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* Soft background ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sageSoft/60 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center space-y-6 relative z-10 max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2 bg-sageSoft border border-emeraldPrimary/20 px-4 py-1.5 rounded-full text-xs font-bold text-emeraldDark">
            <Sparkles className="w-3.5 h-3.5 text-emeraldPrimary" />
            <span>Next-Gen Transit Telemetry & Live GPS</span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-charcoal leading-tight">
            Track Your Bus. <br />
            <span className="text-emeraldPrimary">Know Your Route.</span>
          </h1>

          <p className="text-base sm:text-lg text-mutedGray max-w-2xl mx-auto leading-relaxed">
            Real-time bus tracking, route information and arrival updates — all in one place.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleQuickRoleLaunch('student')}
              className="bg-emeraldPrimary hover:bg-emeraldDark text-white font-bold px-8 py-3.5 rounded-2xl shadow-soft transition transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 text-sm"
            >
              <span>Track a Bus</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/routes"
              className="bg-white hover:bg-sageSoft/40 text-charcoal font-bold px-8 py-3.5 rounded-2xl border border-borderLight transition shadow-sm text-sm"
            >
              Explore Routes
            </Link>
          </div>

          {/* Quick Interactive Demo Role Switcher */}
          <div className="pt-8 border-t border-borderLight max-w-xl mx-auto">
            <span className="text-xs font-bold text-mutedGray uppercase tracking-wider block mb-3">
              ⚡ Instant 1-Click Interactive Demo Portals
            </span>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickRoleLaunch('student')}
                className="card-interactive p-3 text-center group"
              >
                <span className="text-xs font-bold text-emeraldPrimary block group-hover:underline">Student Live Map</span>
                <span className="text-[10px] text-mutedGray">Vinod Patil Portal</span>
              </button>

              <button
                onClick={() => handleQuickRoleLaunch('driver')}
                className="card-interactive p-3 text-center group"
              >
                <span className="text-xs font-bold text-emeraldPrimary block group-hover:underline">Driver Cockpit</span>
                <span className="text-[10px] text-mutedGray">GPS Streamer</span>
              </button>

              <button
                onClick={() => handleQuickRoleLaunch('admin')}
                className="card-interactive p-3 text-center group"
              >
                <span className="text-xs font-bold text-emeraldPrimary block group-hover:underline">Admin Fleet</span>
                <span className="text-[10px] text-mutedGray">Multi-Bus Fleet</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Transportation Visual Illustration (Clean Emerald & Sage) */}
        <div className="mt-14 card-clean p-6 sm:p-8 max-w-4xl mx-auto relative shadow-soft">
          <div className="text-center mb-6">
            <h3 className="font-heading font-bold text-lg text-charcoal">Live Bus Route Architecture</h3>
            <p className="text-xs text-mutedGray">Sub-second continuous location stream from driver mobile phone</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-warmBg p-4 rounded-2xl border border-borderLight space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-sageSoft text-emeraldPrimary flex items-center justify-center mx-auto text-xl font-bold">
                📱
              </div>
              <div className="font-bold text-charcoal text-xs">Driver Smartphone</div>
              <div className="text-[10px] text-mutedGray">Browser watchPosition() GPS</div>
            </div>

            <div className="bg-warmBg p-4 rounded-2xl border border-borderLight space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-sageSoft text-emeraldPrimary flex items-center justify-center mx-auto text-xl font-bold">
                📡
              </div>
              <div className="font-bold text-charcoal text-xs">Socket.IO Gateway</div>
              <div className="text-[10px] text-mutedGray">Real-time Node.js server</div>
            </div>

            <div className="bg-warmBg p-4 rounded-2xl border border-borderLight space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-sageSoft text-emeraldPrimary flex items-center justify-center mx-auto text-xl font-bold">
                🗺️
              </div>
              <div className="font-bold text-charcoal text-xs">Interactive Map</div>
              <div className="text-[10px] text-mutedGray">Emerald marker & polyline</div>
            </div>

            <div className="bg-warmBg p-4 rounded-2xl border border-borderLight space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-sageSoft text-emeraldPrimary flex items-center justify-center mx-auto text-xl font-bold">
                ⏱️
              </div>
              <div className="font-bold text-charcoal text-xs">Live ETA & Progress</div>
              <div className="text-[10px] text-mutedGray">Instant arrival calculation</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Platform Feature Grid */}
      <section className="py-16 bg-white border-t border-borderLight px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading font-extrabold text-3xl text-charcoal">Commercial Transit Platform Features</h2>
          <p className="text-sm text-mutedGray mt-2">Built with React, Vite, Socket.IO, Express & SQLite</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-clean p-6 space-y-3">
            <div className="p-3 rounded-xl bg-mintPale text-emeraldPrimary w-fit border border-sageSoft">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-charcoal text-lg">Real-Time Mobile GPS</h3>
            <p className="text-xs text-mutedGray leading-relaxed">
              Driver device continuously streams coordinates, speed, and heading to server. Bus marker moves smoothly in real-time.
            </p>
          </div>

          <div className="card-clean p-6 space-y-3">
            <div className="p-3 rounded-xl bg-mintPale text-emeraldPrimary w-fit border border-sageSoft">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-charcoal text-lg">Smart "When Should I Leave?"</h3>
            <p className="text-xs text-mutedGray leading-relaxed">
              Combines live bus ETA, student walking speed, and buffer time to calculate exact departure countdown.
            </p>
          </div>

          <div className="card-clean p-6 space-y-3">
            <div className="p-3 rounded-xl bg-mintPale text-emeraldPrimary w-fit border border-sageSoft">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-charcoal text-lg">Routes & Stop Intelligence</h3>
            <p className="text-xs text-mutedGray leading-relaxed">
              Complete route maps, passing buses, next arrival times, and stop progress breakdown.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
