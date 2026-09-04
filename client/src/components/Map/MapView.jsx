import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Locate, Navigation, ZoomIn, ZoomOut, Maximize2, MapPin } from 'lucide-react';
import StopDetailsModal from '../Search/StopDetailsModal';

// 1. Custom User Current Location Pin (📍 You are here) - Distinct from Bus!
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-location-marker',
    html: `
      <div class="relative group cursor-pointer">
        <div class="absolute -inset-2 bg-emeraldPrimary/30 rounded-full blur-sm animate-pulse-subtle"></div>
        <div class="relative bg-charcoal p-2 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs">
          📍
        </div>
        <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-charcoal text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          You are here
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

// 2. Custom Live Bus Marker (🚌 KA 19 AB 1234)
const createBusIcon = (heading = 0) => {
  return L.divIcon({
    className: 'custom-emerald-bus-marker',
    html: `
      <div style="transform: rotate(${heading}deg); transition: transform 0.6s ease-out;" class="relative group cursor-pointer">
        <div class="absolute -inset-2.5 bg-statusLive/40 rounded-full blur-sm animate-pulse"></div>
        <div class="relative bg-emeraldPrimary p-2.5 rounded-full border-2 border-white shadow-md flex items-center justify-center">
          <span style="font-size: 18px;">🚌</span>
        </div>
        <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-emeraldPrimary border border-borderLight text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
          ● LIVE BUS
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

// 3. Custom Target Stop Pin (🎯 Your Destination - Amber/Gold #D99A24)
const createTargetStopIcon = (stopName = 'Destination') => {
  return L.divIcon({
    className: 'custom-target-stop-marker',
    html: `
      <div class="relative group cursor-pointer">
        <div class="absolute -inset-3 bg-statusWarning/35 rounded-full blur-sm animate-bounce"></div>
        <div class="relative bg-statusWarning p-2 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-extrabold text-xs">
          🎯
        </div>
        <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-statusWarning text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
          Your Destination
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

// 4. Custom Stop Pin (Emerald check for completed, Live green for current, Amber for next, Gray for upcoming)
const createStopIcon = (stop, isCurrent, isCompleted, isTarget) => {
  if (isTarget) return createTargetStopIcon(stop.name);

  let bgColor = 'bg-white border-upcomingGray text-mutedGray';
  let badgeContent = stop.sequence_order;

  if (isCompleted) {
    bgColor = 'bg-emeraldPrimary border-emeraldDark text-white';
    badgeContent = '✓';
  } else if (isCurrent) {
    bgColor = 'bg-statusLive border-white text-white font-bold animate-bounce';
    badgeContent = '●';
  }

  return L.divIcon({
    className: 'custom-stop-pin',
    html: `
      <div class="flex flex-col items-center group cursor-pointer">
        <div class="w-7 h-7 ${bgColor} rounded-full border-2 shadow-sm flex items-center justify-center font-bold text-xs">
          ${badgeContent}
        </div>
        <div class="bg-white text-charcoal text-[11px] px-2 py-0.5 rounded-md border border-borderLight shadow-sm mt-1 whitespace-nowrap font-medium">
          ${stop.name}
        </div>
      </div>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 15]
  });
};

// Map Recenter Helper
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 14, { animate: true, duration: 1.0 });
    }
  }, [center, map]);
  return null;
}

export default function MapView({
  busLocation,
  stops = [],
  userLocation,
  targetStop,
  onSelectBus,
  onSelectStop
}) {
  const mapRef = useRef(null);
  const [selectedStopModal, setSelectedStopModal] = useState(null);

  const defaultCenter = [12.8988, 74.8456];
  const busCoords = busLocation ? [busLocation.lat, busLocation.lng] : defaultCenter;
  const polylineCoords = stops.map(s => [s.lat, s.lng]);

  const completedIndex = busLocation?.routeAnalysis?.completedStops?.length || 2;
  const completedPolyline = polylineCoords.slice(0, completedIndex + 1);
  const remainingPolyline = polylineCoords.slice(completedIndex);

  return (
    <div className="relative w-full h-[460px] lg:h-[550px] rounded-2xl overflow-hidden border border-borderLight shadow-soft bg-warmBg">
      
      {/* Live Status Top Overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-borderLight shadow-sm">
        <div className="w-2.5 h-2.5 rounded-full bg-statusLive animate-pulse"></div>
        <span className="text-xs font-bold text-charcoal tracking-wide">Live GPS Location Feed</span>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-borderLight shadow-sm hidden sm:flex items-center gap-4 text-[11px] font-semibold text-charcoal">
        <div className="flex items-center gap-1">
          <span className="text-sm">🟢</span> Bus
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm">📍</span> Your Location
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm">🎯</span> Target Stop
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emeraldPrimary inline-block"></span> Completed
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-statusLive inline-block"></span> Current
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-upcomingGray inline-block"></span> Upcoming
        </div>
      </div>

      {/* Floating White Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1.5">
        {userLocation && (
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { animate: true });
              }
            }}
            className="flex items-center gap-1.5 bg-white hover:bg-sageSoft text-charcoal border border-borderLight px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition"
            title="Center on My Location"
          >
            <Locate className="w-4 h-4 text-emeraldPrimary" />
            <span className="hidden sm:inline">My Location</span>
          </button>
        )}

        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="bg-white hover:bg-sageSoft text-charcoal p-2 rounded-xl border border-borderLight shadow-sm transition text-xs font-bold flex items-center justify-center"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="bg-white hover:bg-sageSoft text-charcoal p-2 rounded-xl border border-borderLight shadow-sm transition text-xs font-bold flex items-center justify-center"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      <MapContainer
        center={busCoords}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO Voyager</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapRecenter center={busCoords} />

        {/* 1. Completed Route Polyline (Emerald #16866A) */}
        {completedPolyline.length > 1 && (
          <Polyline
            positions={completedPolyline}
            color="#16866A"
            weight={6}
            opacity={0.9}
          />
        )}

        {/* 2. Remaining Route Polyline (Soft Neutral #CBD5CF) */}
        {remainingPolyline.length > 1 && (
          <Polyline
            positions={remainingPolyline}
            color="#CBD5CF"
            weight={4}
            opacity={0.8}
            dashArray="6, 10"
          />
        )}

        {/* 3. User Current Location Pin (📍 You are here) */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserLocationIcon()}
          >
            <Popup>
              <div className="p-1 text-center font-bold text-xs text-charcoal">
                📍 You are here
                <div className="text-[10px] text-mutedGray font-normal mt-0.5">{userLocation.address || 'Your Position'}</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 4. Target Stop Marker (🎯 Your Destination) */}
        {targetStop && targetStop.lat && targetStop.lng && (
          <Marker
            position={[targetStop.lat, targetStop.lng]}
            icon={createTargetStopIcon(targetStop.name)}
          >
            <Popup>
              <div className="p-1 text-center">
                <div className="font-extrabold text-statusWarning text-xs">🎯 Your Destination</div>
                <div className="text-xs font-bold text-charcoal">{targetStop.name}</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 5. Route Stops Markers */}
        {stops.map((stop) => {
          const isCompleted = busLocation?.routeAnalysis?.completedStops?.some(s => s.id === stop.id);
          const isCurrent = busLocation?.routeAnalysis?.currentStop?.id === stop.id;
          const isTarget = targetStop && (targetStop.id === stop.id || targetStop.name === stop.name);

          return (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lng]}
              icon={createStopIcon(stop, isCurrent, isCompleted, isTarget)}
              eventHandlers={{
                click: () => {
                  setSelectedStopModal(stop);
                  if (onSelectStop) onSelectStop(stop);
                }
              }}
            >
              <Popup>
                <div className="p-1">
                  <div className="font-bold text-charcoal text-xs">{stop.name}</div>
                  <div className="text-[11px] text-mutedGray mt-0.5">Stop #{stop.sequence_order} • Approx {stop.est_minutes_from_start} min from origin</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 6. Live Emerald Bus Marker (🚌 Bus KA 19 AB 1234) */}
        {busLocation && (
          <Marker
            position={[busLocation.lat, busLocation.lng]}
            icon={createBusIcon(busLocation.heading || 0)}
            eventHandlers={{
              click: () => {
                if (onSelectBus) onSelectBus(busLocation);
              }
            }}
          >
            <Popup>
              <div className="p-1 text-center">
                <div className="font-extrabold text-emeraldPrimary text-sm">Bus {busLocation.busNumber || '101'}</div>
                <div className="text-xs font-mono text-mutedGray font-semibold">{busLocation.regNumber || 'KA 19 AB 1234'}</div>
                <div className="text-xs text-charcoal font-semibold mt-0.5">Speed: {busLocation.speed || 32} km/h</div>
                <div className="text-[11px] text-statusLive font-bold mt-1">● Live GPS Broadcast</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Stop Click Details Popup Modal */}
      {selectedStopModal && (
        <StopDetailsModal
          stop={selectedStopModal}
          onClose={() => setSelectedStopModal(null)}
        />
      )}
    </div>
  );
}
