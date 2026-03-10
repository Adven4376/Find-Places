import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet-rotatedmarker";
import L from "leaflet";

/* ---------------- NAVIGATION ICON ---------------- */

const navigationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20]
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

export default function NavigationScreen({ data, routeCoords, onExit, onReRoute }) {

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [speed, setSpeed] = useState(0);

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

      speechSynthesis.cancel();

      const msg = new SpeechSynthesisUtterance(
        data.steps[currentStepIndex].instruction
      );

      msg.rate = 1;
      msg.pitch = 1;

      speechSynthesis.speak(msg);

      spokenStepRef.current = currentStepIndex;

    }, [currentStepIndex, data.steps]);

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

          map.flyTo([lat, lng], 16, { duration: 1 });

          /* ----- REROUTE DETECTION ----- */

          const isNearRoute = routeCoords.some(([rLat, rLng]) => {

            const dist = haversine(lat, lng, rLat, rLng);

            return dist < 50;

          });

          if (!isNearRoute) {
            onDeviation(lat, lng);
          }

          /* ----- STEP PROGRESS ----- */

          const currentStep = data.steps[currentStepIndex];

          if (currentStep) {

            const [stepLng, stepLat] = currentStep.location;

            const distance = haversine(lat, lng, stepLat, stepLng);

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
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-[#0f172a]">

      {/* HEADER */}

      <div className="bg-white dark:bg-[#0b1120] shadow-md p-4 flex justify-between items-center">

        <button onClick={onExit} className="text-red-500 font-semibold">
          Back
        </button>

        <div className="text-center">
          <div className="text-sm text-gray-500">Distance</div>
          <div className="font-semibold">{data.distance}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500">ETA</div>
          <div className="font-semibold">{data.duration}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500">Speed</div>
          <div className="font-semibold">{speed} km/h</div>
        </div>

      </div>

      {/* MAP */}

      <div className="flex-1 relative">

        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[5000]">

          {data.steps[currentStepIndex] && (
            <div className="bg-black/80 text-white px-6 py-3 rounded-2xl shadow-xl text-lg backdrop-blur-lg">
              {data.steps[currentStepIndex].instruction}
            </div>
          )}

        </div>

        <MapContainer
          center={routeCoords[0]}
          zoom={14}
          className="h-full w-full"
        >

          <FollowUser
            routeCoords={routeCoords}
            currentStepIndex={currentStepIndex}
            setCurrentStepIndex={setCurrentStepIndex}
            onDeviation={(lat, lng) => onReRoute(lat, lng)}
          />

          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Polyline positions={routeCoords} color="blue" />

          <Marker position={routeCoords[0]} />
          <Marker position={routeCoords[routeCoords.length - 1]} />

        </MapContainer>

      </div>

      {/* TURN BY TURN PANEL */}

      <div className="bg-white dark:bg-[#0b1120] p-4 max-h-60 overflow-y-auto border-t dark:border-white/10">

        <h3 className="font-semibold mb-3">Turn by Turn</h3>

        {data.steps.map((step, index) => (

          <div
            key={index}
            className={`p-3 mb-2 rounded-lg transition-all duration-300 ${
              index === currentStepIndex
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