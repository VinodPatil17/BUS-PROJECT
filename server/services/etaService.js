// Haversine formula to compute distance in kilometers between two lat/lng points
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate ETA in minutes based on distance and average urban speed
function calculateEtaMinutes(distanceKm, speedKmh = 30) {
  const effectiveSpeed = Math.max(speedKmh, 15); // Minimum fallback speed 15 km/h
  const timeHours = distanceKm / effectiveSpeed;
  const timeMinutes = Math.round(timeHours * 60);
  return Math.max(1, timeMinutes);
}

/**
 * Stable stop detection algorithm with hysteresis
 * Prevents rapid stop flickering due to minor GPS fluctuations
 */
function analyzeRouteProgress(busLat, busLng, busSpeed, stops, lastKnownStopIndex = 0) {
  if (!stops || stops.length === 0) {
    return {
      currentStop: null,
      nextStop: null,
      completedStops: [],
      remainingStops: [],
      progressPercent: 0,
      nextStopDistanceKm: 0,
      nextStopEtaMinutes: 0
    };
  }

  // Find nearest stop to current bus position
  let minDistance = Infinity;
  let nearestStopIndex = 0;

  stops.forEach((stop, index) => {
    const dist = getDistanceKm(busLat, busLng, stop.lat, stop.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestStopIndex = index;
    }
  });

  // Hysteresis threshold: 280 meters (0.28 km)
  // If bus is within 280m of a stop, it is considered AT that stop
  const isAtStop = minDistance < 0.28;

  // Use monotonically progressing stop index to avoid jumping backwards
  let currentStopIndex = Math.max(lastKnownStopIndex, nearestStopIndex);

  let nextStopIndex = currentStopIndex + (isAtStop ? 1 : 1);
  if (nextStopIndex >= stops.length) {
    nextStopIndex = stops.length - 1;
  }

  const currentStop = stops[currentStopIndex];
  const nextStop = stops[nextStopIndex];

  const completedStops = stops.slice(0, currentStopIndex + (isAtStop ? 1 : 0));
  const remainingStops = stops.slice(currentStopIndex + (isAtStop ? 1 : 0));

  const distanceToNextKm = getDistanceKm(busLat, busLng, nextStop.lat, nextStop.lng);
  const etaToNextMin = calculateEtaMinutes(distanceToNextKm, busSpeed);

  const totalStops = stops.length;
  const progressPercent = Math.min(
    100,
    Math.round(((currentStopIndex + (isAtStop ? 1 : 0)) / totalStops) * 100)
  );

  return {
    isAtStop,
    currentStopIndex,
    currentStop,
    nextStop,
    completedStops,
    remainingStops,
    progressPercent,
    nextStopDistanceKm: parseFloat(distanceToNextKm.toFixed(2)),
    nextStopEtaMinutes: etaToNextMin
  };
}

/**
 * Check target stop arrival proximity and trigger destination alerts
 */
function checkTargetStopProximity(busLat, busLng, targetStop, remainingStops = []) {
  if (!targetStop || !targetStop.lat || !targetStop.lng) {
    return { status: 'NO_TARGET', message: '' };
  }

  const distanceToTargetKm = getDistanceKm(busLat, busLng, targetStop.lat, targetStop.lng);
  
  // Find remaining stops count until target stop
  let stopsRemaining = 0;
  if (remainingStops && remainingStops.length > 0) {
    const targetIdx = remainingStops.findIndex(s => s.id === targetStop.id || s.name === targetStop.name);
    if (targetIdx !== -1) {
      stopsRemaining = targetIdx;
    }
  }

  let status = 'FAR';
  let message = '';
  let isArrived = false;

  if (distanceToTargetKm <= 0.15) {
    status = 'ARRIVED';
    message = `✓ Arrived at ${targetStop.name}`;
    isArrived = true;
  } else if (distanceToTargetKm <= 0.5 || stopsRemaining === 1) {
    status = 'APPROACHING_1_STOP';
    message = `🔔 Approaching Your Destination: Bus is 1 stop away from ${targetStop.name}`;
  } else if (stopsRemaining === 2) {
    status = 'APPROACHING_2_STOPS';
    message = `🔔 Bus is 2 stops remaining until ${targetStop.name}`;
  } else if (distanceToTargetKm <= 2.0) {
    status = 'NEARBY';
    message = `Bus is ${distanceToTargetKm.toFixed(1)} km away from ${targetStop.name}`;
  }

  return {
    targetStopName: targetStop.name,
    distanceToTargetKm: parseFloat(distanceToTargetKm.toFixed(2)),
    stopsRemaining,
    status,
    message,
    isArrived
  };
}

/**
 * Intelligent "When Should I Leave?" calculator for students
 */
function calculateSmartLeaveRecommendation(busEtaMinutes, walkingTimeMinutes = 5, bufferMinutes = 2) {
  const totalNeededMinutes = walkingTimeMinutes + bufferMinutes;
  const leaveInMinutes = busEtaMinutes - totalNeededMinutes;

  let recommendationMessage = '';
  let status = 'normal';

  if (leaveInMinutes <= 0) {
    status = 'urgent';
    recommendationMessage = `⚠️ Leave IMMEDIATELY! The bus arrives in ${busEtaMinutes} min (walking: ${walkingTimeMinutes} min).`;
  } else if (leaveInMinutes <= 3) {
    status = 'warning';
    recommendationMessage = `🚶 Prepare to leave in ${leaveInMinutes} min to reach your stop comfortably.`;
  } else {
    status = 'relaxed';
    recommendationMessage = `⏱️ Recommended departure in ${leaveInMinutes} min.`;
  }

  return {
    busEtaMinutes,
    walkingTimeMinutes,
    bufferMinutes,
    leaveInMinutes: Math.max(0, leaveInMinutes),
    status,
    recommendationMessage
  };
}

module.exports = {
  getDistanceKm,
  calculateEtaMinutes,
  analyzeRouteProgress,
  checkTargetStopProximity,
  calculateSmartLeaveRecommendation
};
