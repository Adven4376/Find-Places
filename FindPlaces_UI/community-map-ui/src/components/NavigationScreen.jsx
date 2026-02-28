import { MapContainer, TileLayer, Polyline, Marker,useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";

import L from "leaflet";




export default function NavigationScreen({ data, routeCoords, onExit, onReRoute }) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    function FollowUser({ routeCoords, onDeviation }) {
  const map = useMap();
  const [position, setPosition] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
  if (!data.steps[currentStepIndex]) return;

  const msg = new SpeechSynthesisUtterance(
    data.steps[currentStepIndex].instruction
  );

  msg.rate = 1;
  msg.pitch = 1;

  speechSynthesis.cancel(); // prevent stacking
  speechSynthesis.speak(msg);

}, [currentStepIndex, data.steps]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setPosition([lat, lng]);

        map.flyTo([lat, lng], 16, {
          duration: 1.5
        });

        // 🔥 deviation detection
        const isNearRoute = routeCoords.some(
          ([rLat, rLng]) =>
            Math.abs(rLat - lat) < 0.001 &&
            Math.abs(rLng - lng) < 0.001
        );

        if (!isNearRoute) {
          onDeviation(lat, lng);
        }

        // 🔥 step progress detection
        const nextIndex = routeCoords.findIndex(
        ([rLat, rLng]) =>
            Math.abs(rLat - lat) < 0.0005 &&
            Math.abs(rLng - lng) < 0.0005
        );

        if (nextIndex !== -1) {
        setCurrentStepIndex(nextIndex);
        }

      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, routeCoords, onDeviation]);

  return position ? <Marker position={position} /> : null;
}

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-[#0f172a]">

      {/* HEADER */}
      <div className="bg-white dark:bg-[#0b1120] shadow-md p-4 flex justify-between items-center">
        <button
          onClick={onExit}
          className="text-red-500 font-semibold"
        >
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
      </div>


      {/* MAP */}
      <div className="flex-1 relative">
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[5000]">
        {data.steps[currentStepIndex] && (
            <div className="bg-black/80 text-white px-6 py-3 rounded-2xl shadow-xl text-lg animate-pulse backdrop-blur-lg">
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
            onDeviation={(lat, lng) => {
                onReRoute(lat, lng);
            }}
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

        {data.steps.length === 0 && (
          <p className="text-sm text-gray-500">
            No step details available.
          </p>
        )}

        {data.steps.map((step, index) => (
          <div
            key={index}
            className={`p-3 mb-2 rounded-lg transition-all ${
            index === currentStepIndex
                ? "bg-blue-600 text-white scale-105 shadow-lg"
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