import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";

export default function NavigationScreen({ data, routeCoords, onExit }) {

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
      <div className="flex-1">
        <MapContainer
          center={routeCoords[0]}
          zoom={14}
          className="h-full w-full"
        >
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
            className="p-3 mb-2 rounded-lg bg-gray-100 dark:bg-white/5"
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