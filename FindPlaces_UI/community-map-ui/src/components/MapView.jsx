import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline
} from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import MarkerClusterGroup from "react-leaflet-cluster";
import api from "../api/axios";
import PlaceDetails from "./PlaceDetails";
import AddPlaceForm from "./AddPlaceForm";
import "leaflet/dist/leaflet.css";

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

/* ---------------- MAIN COMPONENT ---------------- */

export default function MapView() {
  const [places, setPlaces] = useState([]);
  const [displayedPlaces, setDisplayedPlaces] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  /* ----- Category Filter States ----- */
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [categories, setCategories] = useState([]);

  /* ---------------- FETCH PLACES ---------------- */

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

  /* ---------------- AUTO CATEGORY GENERATION ---------------- */

  useEffect(() => {
    if (!places || places.length === 0) return;

    const unique = [
      "ALL",
      ...new Set(places.map((p) => p.category))
    ];

    setCategories(unique);
  }, [places]);

  /* ---------------- LIVE LOCATION ---------------- */

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      setCurrentLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  }, []);

  /* ---------------- NAVIGATION ---------------- */

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

  /* ---------------- RENDER ---------------- */

  return (
    <div className="relative h-full w-full">

      {/* -------- Premium Category Filter -------- */}
      <div className="absolute top-4 left-4 z-[3000] w-64">
        <div
          className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 cursor-pointer"
          onClick={() => setCategoryOpen(!categoryOpen)}
        >
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-800 dark:text-white">
              {selectedCategory}
            </span>
            <span className="text-gray-500">⌄</span>
          </div>
        </div>

        {categoryOpen && (
          <div className="mt-2 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-3 max-h-60 overflow-y-auto">
            <input
              type="text"
              placeholder="Search category..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full mb-2 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />

            {categories
              .filter((cat) =>
                cat.toLowerCase().includes(categorySearch.toLowerCase())
              )
              .map((cat) => (
                <div
                  key={cat}
                  onClick={() => {
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
                  }}
                  className={`px-3 py-2 rounded-md cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 ${
                    selectedCategory === cat
                      ? "bg-blue-500 text-white"
                      : "text-gray-800 dark:text-white"
                  }`}
                >
                  {cat}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* -------- Floating Add Button -------- */}
      <button
        onClick={() => setShowAddForm(true)}
        className="absolute bottom-6 right-6 z-[3000] bg-blue-600 text-white p-4 rounded-full shadow-xl text-xl hover:bg-blue-700 transition"
      >
        +
      </button>

      {/* -------- MAP -------- */}
      <MapContainer
        center={[17.385, 78.4867]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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

      {/* -------- PLACE DETAILS -------- */}
      {selectedPlace && (
        <PlaceDetails
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onNavigate={handleNavigate}
        />
      )}

      {/* -------- ADD PLACE FORM -------- */}
      {showAddForm && (
        <AddPlaceForm
          onClose={() => setShowAddForm(false)}
          onSuccess={fetchPlaces}
        />
      )}
    </div>
  );
}