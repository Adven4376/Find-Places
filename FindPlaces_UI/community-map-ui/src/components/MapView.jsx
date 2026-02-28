import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap
} from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import MarkerClusterGroup from "react-leaflet-cluster";
import api from "../api/axios";
import PlaceDetails from "./PlaceDetails";
import AddPlaceForm from "./AddPlaceForm";


/* ---------------- ICON FIX ---------------- */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

/* ---------------- AUTO ZOOM COMPONENT ---------------- */

function AutoZoom({ places }) {
  const map = useMap();

  useEffect(() => {
    if (!places || places.length === 0) return;

    const bounds = L.latLngBounds(
      places.map((p) => [p.latitude, p.longitude])
    );

    map.fitBounds(bounds, { padding: [80, 80] });
  }, [places, map]);

  return null;
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function MapView() {
  const [places, setPlaces] = useState([]);
  const [displayedPlaces, setDisplayedPlaces] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const [categorySearch, setCategorySearch] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const res = await api.get("/api/places?size=50");
      setPlaces(res.data.content);
      setDisplayedPlaces(res.data.content);
    } catch (err) {
      console.error("Failed to fetch places", err);
    }
  };

  useEffect(() => {
    if (!places || places.length === 0) return;

    const unique = [
      "ALL",
      ...new Set(places.map((p) => p.category))
    ];

    setCategories(unique);
  }, [places]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      setCurrentLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  }, []);

  const handleNavigate = async (place) => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await api.get("/api/directions", {
          params: {
            fromLat: pos.coords.latitude,
            fromLng: pos.coords.longitude,
            toLat: place.latitude,
            toLng: place.longitude
          }
        });

        const decoded = polyline.decode(res.data.polyline);
        const latLngs = decoded.map(([lat, lng]) => [lat, lng]);

        setRouteCoords(latLngs);
      } catch (err) {
        console.error("Failed to fetch route", err);
      }
    });
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCategoryOpen(false);

    if (cat === "ALL") {
      setDisplayedPlaces(places);
    } else {
      const filtered = places.filter(
        (p) => p.category === cat
      );
      setDisplayedPlaces(filtered);
    }
  };

  return (
  <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#0f172a] dark:to-[#111827]">

    {/* LEFT PANEL - LIST DOMINANT */}
   <div className="w-3/5 flex flex-col border-r border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl">

      {/* CATEGORY + SEARCH HEADER */}
      <div className="p-4 bg-white dark:bg-gray-900 shadow-sm">
        <div className="relative">
          <div
            className="bg-gray-200 dark:bg-gray-800 rounded-lg p-3 cursor-pointer"
            onClick={() => setCategoryOpen(!categoryOpen)}
          >
            {selectedCategory}
          </div>

          {categoryOpen && (
            <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
              <input
                type="text"
                placeholder="Search category..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full p-2 border-b dark:bg-gray-700"
              />
              {categories
                .filter((cat) =>
                  cat.toLowerCase().includes(categorySearch.toLowerCase())
                )
                .map((cat) => (
                  <div
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className="p-3 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    {cat}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* SCROLLABLE PLACE LIST */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 scroll-smooth">
        {displayedPlaces.map((place) => (
          <div
            key={place.id}
            onClick={() => setSelectedPlace(place)}
            className="
            bg-white/80 dark:bg-white/5
            backdrop-blur-lg
            border border-gray-200 dark:border-white/10
            rounded-2xl
            p-5
            shadow-sm
            hover:shadow-xl
            hover:-translate-y-1
            transition-all duration-300
            cursor-pointer
            "
          >
            <h3 className="text-xl font-semibold tracking-tight text-gray-800 dark:text-white">
              {place.name}
            </h3>
            <p className="text-xs uppercase tracking-widest text-blue-500 dark:text-blue-400 font-medium">
              {place.category}
            </p>
            <p className="text-sm mt-1">
              {place.description?.slice(0, 80)}...
            </p>
          </div>
        ))}

      </div>
    </div>

    {/* RIGHT PANEL - MAP */}
   <div className="w-2/5 p-6 flex flex-col relative">

  {/* Rounded Map Container */}
  <div className="
    flex-1
    rounded-3xl
    overflow-hidden
    border border-gray-200 dark:border-white/10
    shadow-2xl
    bg-white dark:bg-[#0b1120]
  ">

    <MapContainer
      center={[17.385, 78.4867]}
      zoom={13}
      className="h-full w-full"
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <AutoZoom places={displayedPlaces} />

      <MarkerClusterGroup chunkedLoading>
        {displayedPlaces.map((place) => (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            eventHandlers={{
              click: () => setSelectedPlace(place)
            }}
          />
        ))}
      </MarkerClusterGroup>

      {currentLocation && (
        <Marker position={[currentLocation.lat, currentLocation.lng]} />
      )}

      {routeCoords.length > 0 && (
        <Polyline positions={routeCoords} color="blue" />
      )}
    </MapContainer>
  </div>

  {/* Floating Add Button - OUTSIDE map wrapper */}
  <button
    onClick={() => setShowAddForm(true)}
    className="
      absolute bottom-10 right-10
      bg-gradient-to-r from-blue-500 to-indigo-600
      text-white
      p-5
      rounded-full
      shadow-2xl
      hover:scale-110
      transition-all duration-300
    "
  >
    +
  </button>

</div>

    {/* DETAILS PANEL */}
    {selectedPlace && (
  <PlaceDetails
    place={selectedPlace}
    onClose={() => setSelectedPlace(null)}
    onNavigate={handleNavigate}
  />
)}

{showAddForm && (
  <AddPlaceForm
    onClose={() => setShowAddForm(false)}
    onSuccess={fetchPlaces}
  />
)}

  </div>
);
}