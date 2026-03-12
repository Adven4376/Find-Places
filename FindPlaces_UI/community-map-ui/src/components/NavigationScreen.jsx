import { MapContainer, TileLayer, Polyline, Marker, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet-rotatedmarker";
import L from "leaflet";

/* ---------------- NAVIGATION ICON ---------------- */

const navigationIcon = new L.divIcon({
  className: "bg-transparent border-none",
  html: `
    <div style="display:flex; justify-content:center; align-items:center; filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.5)); transform: translateY(-4px);">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L4 21L12 17L20 21L12 3Z" fill="#4285F4" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
      </svg>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24]
});

/* ---------------- DESTINATION ICON ---------------- */

const destinationIcon = new L.divIcon({
  className: "custom-destination-pin",
  html: `
    <div class="relative flex h-10 w-10 items-center justify-center">
      <span class="animate-bounce absolute inline-flex h-8 w-8 rounded-full bg-red-500 opacity-60"></span>
      <svg class="relative w-8 h-8 text-red-600 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

/* ---------------- DISTANCE FUNCTION ---------------- */

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (x) => x * Math.PI / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) *
    Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/* ---------------- BEARING FUNCTION ---------------- */

function calculateBearing(lat1, lng1, lat2, lng2) {

  const toRad = (deg) => deg * Math.PI / 180;
  const toDeg = (rad) => rad * 180 / Math.PI;

  const dLon = toRad(lng2 - lng1);

  const y = Math.sin(dLon) * Math.cos(toRad(lat2));

  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.cos(dLon);

  const brng = Math.atan2(y, x);

  return (toDeg(brng) + 360) % 360;
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function NavigationScreen({ data, routeCoords, onExit, onReRoute, travelMode, onTravelModeChange }) {

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [speed, setSpeed] = useState(0);

  const [muted, setMuted] = useState(false);
  const [isAutoPanning, setIsAutoPanning] = useState(true);
  const [hasArrived, setHasArrived] = useState(false);

  function MapEventsHandler() {
    useMapEvents({
      dragstart: () => setIsAutoPanning(false),
      touchstart: () => setIsAutoPanning(false),
      mousedown: () => setIsAutoPanning(false),
      wheel: () => setIsAutoPanning(false)
    });
    return null;
  }

  function FollowUser({
    routeCoords,
    currentStepIndex,
    setCurrentStepIndex,
    onDeviation
  }) {

    const map = useMap();

    const [position, setPosition] = useState(null);
    const [heading, setHeading] = useState(0);

    const previousPosition = useRef(null);
    const spokenStepRef = useRef(-1);

    /* ---------------- COMPASS SUPPORT ---------------- */

    useEffect(() => {

      const handleOrientation = (event) => {

        if (event.alpha !== null) {
          setHeading(event.alpha);
        }

      };

      window.addEventListener("deviceorientationabsolute", handleOrientation);

      return () =>
        window.removeEventListener("deviceorientationabsolute", handleOrientation);

    }, []);

    /* ---------------- VOICE NAVIGATION ---------------- */

    useEffect(() => {

      if (!data.steps[currentStepIndex]) return;

      if (spokenStepRef.current === currentStepIndex) return;

      if (muted) return;

      speechSynthesis.cancel();

      const msg = new SpeechSynthesisUtterance(
        data.steps[currentStepIndex].instruction
      );

      msg.rate = 1;
      msg.pitch = 1;

      speechSynthesis.speak(msg);

      spokenStepRef.current = currentStepIndex;

    }, [currentStepIndex, data.steps, muted]);

    useEffect(() => {
      return () => speechSynthesis.cancel();
    }, []);

    /* ---------------- GPS TRACKING ---------------- */

    useEffect(() => {

      const watchId = navigator.geolocation.watchPosition(

        (pos) => {

          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          setPosition([lat, lng]);

          if (pos.coords.speed) {
            setSpeed((pos.coords.speed * 3.6).toFixed(1));
          }

          /* ----- MOVEMENT BEARING ----- */

          if (previousPosition.current) {

            const bearing = calculateBearing(
              previousPosition.current[0],
              previousPosition.current[1],
              lat,
              lng
            );

            setHeading(bearing);
          }

          previousPosition.current = [lat, lng];

          /* ----- FOLLOW USER ----- */

          if (isAutoPanning) {
            map.panTo([lat, lng], {
              animate: true,
              duration: 1.5,
              easeLinearity: 0.2
            });
          }

          /* ----- REROUTE DETECTION ----- */

          const isNearRoute = routeCoords.some(([rLat, rLng]) => {
            const dist = haversine(lat, lng, rLat, rLng);
            return dist < 50;
          });

          if (!isNearRoute && !hasArrived) {
            onDeviation(lat, lng);
          }

          /* ----- STEP PROGRESS ----- */

          const currentStep = data.steps[currentStepIndex];

          if (currentStep) {
            const [stepLng, stepLat] = currentStep.location;
            const distance = haversine(lat, lng, stepLat, stepLng);

            // Arrival check
            if (currentStepIndex === data.steps.length - 1 && distance < 30) {
              setHasArrived(true);
            }

            if (distance < 40) {
              setCurrentStepIndex((prev) =>
                prev < data.steps.length - 1 ? prev + 1 : prev
              );
            }
          }

        },

        (err) => console.error(err),

        { enableHighAccuracy: true }

      );

      return () => navigator.geolocation.clearWatch(watchId);

    }, [map, routeCoords]);

    /* ---------------- USER MARKER ---------------- */

    return position ? (
      <Marker
        position={position}
        icon={navigationIcon}
        rotationAngle={heading}
        rotationOrigin="center"
      />
    ) : null;
  }

  return (
    <div className="h-screen pt-[80px] md:pt-[100px] flex flex-col bg-gray-100 dark:bg-[#0f172a]">

      {/* HEADER */}

      <div className="bg-white dark:bg-[#0b1120] shadow-md px-4 py-3 flex flex-wrap justify-between items-center gap-2">

        <button onClick={onExit} className="text-red-500 font-semibold">
          Back
        </button>

        <div className="flex gap-3">

          {/* TRAVEL MODE */}

          <button
            onClick={() => onTravelModeChange("DRIVE")}
            className={`px-3 py-1 rounded transition-colors ${travelMode === "DRIVE" ? "bg-blue-600 text-white shadow" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            🚗
          </button>

          <button
            onClick={() => onTravelModeChange("TWO_WHEELER")}
            className={`px-3 py-1 rounded transition-colors ${travelMode === "TWO_WHEELER" ? "bg-blue-600 text-white shadow" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            🏍
          </button>

          <button
            onClick={() => onTravelModeChange("WALK")}
            className={`px-3 py-1 rounded transition-colors ${travelMode === "WALK" ? "bg-blue-600 text-white shadow" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            🚶
          </button>

        </div>

        {/* MUTE BUTTON */}

        <button
          onClick={() => setMuted(!muted)}
          className="text-xl"
        >
          {muted ? "🔇" : "🔊"}
        </button>

        <div className="text-center">
          <div className="text-sm text-gray-500">Speed</div>
          <div className="font-semibold">{speed} km/h</div>
        </div>

      </div>

      {/* MAP */}

      <div className="flex-1 relative">

        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[5000] w-[90%] md:w-auto">
          {hasArrived ? (
            <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-xl font-bold text-center border-4 border-emerald-400 animate-bounce">
              🎉 You have arrived!
            </div>
          ) : data.steps[currentStepIndex] ? (
            <div className="bg-black/85 text-white px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between gap-4">
              <span className="text-lg font-medium tracking-wide">
                {data.steps[currentStepIndex].instruction}
              </span>
              <span className="text-blue-400 font-bold whitespace-nowrap">
                {data.steps[currentStepIndex].distance}
              </span>
            </div>
          ) : null}
        </div>

        {!isAutoPanning && !hasArrived && (
          <button
            onClick={() => setIsAutoPanning(true)}
            className="absolute bottom-6 right-6 z-[5000] bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-2xl font-bold tracking-wide transition-all duration-300 flex items-center gap-2"
          >
            📍 Recenter
          </button>
        )}

        <MapContainer
          center={routeCoords[0]}
          zoom={16}
          className="h-full w-full"
        >
          <MapEventsHandler />

          <FollowUser
            routeCoords={routeCoords}
            currentStepIndex={currentStepIndex}
            setCurrentStepIndex={setCurrentStepIndex}
            onDeviation={(lat, lng) => onReRoute(lat, lng)}
          />

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Outer Border for smoother Google Maps-like Polyline */}
          <Polyline 
            positions={routeCoords} 
            color="#2A5CAD" 
            weight={10} 
            opacity={0.8}
            lineCap="round" 
            lineJoin="round" 
          />
          {/* Inner Fill */}
          <Polyline 
            positions={routeCoords} 
            color="#4285F4" 
            weight={6} 
            opacity={1}
            lineCap="round" 
            lineJoin="round" 
          />

          {/* Remove duplicate logic that generates fixed blue current marker from Map component, since FollowUser already renders it */}
          <Marker position={routeCoords[routeCoords.length - 1]} icon={destinationIcon} />

        </MapContainer>

      </div>

      {/* TURN BY TURN PANEL */}

      <div className="bg-white dark:bg-[#0b1120] p-4 max-h-60 overflow-y-auto border-t dark:border-white/10">

        <h3 className="font-semibold mb-3">Turn by Turn</h3>

        {data.steps.map((step, index) => (

          <div
            key={index}
            className={`p-3 mb-2 rounded-lg transition-all duration-300 ${index === currentStepIndex
              ? "bg-blue-600 text-white shadow-lg scale-105"
              : "bg-gray-100 dark:bg-white/5"
              }`}
          >

            <div className="text-sm font-medium">
              {step.instruction}
            </div>

            <div className="text-xs text-gray-500">
              {step.distance}
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}