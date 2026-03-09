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
import NavigationScreen from "./NavigationScreen";
import { Popup } from "react-leaflet";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";


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

  const [navigationMode, setNavigationMode] = useState(false);
  const [navigationData, setNavigationData] = useState(null);

  const [sheetOpen, setSheetOpen] = useState(false);

  const [aiQuery, setAiQuery] = useState("");

  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [hoverPhoto, setHoverPhoto] = useState(null);

  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const res = await api.get("/places?size=50");
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
  if (!navigator.geolocation) {
    console.log("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      console.log("LOCATION SUCCESS:", pos.coords);

      setCurrentLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    },
    (err) => {
      console.error("LOCATION ERROR:", err.code, err.message);
      alert("Location access failed: " + err.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    }
  );
}, []);

  const handleHover = async (place) => {
  setHoveredPlace(place);

  try {
    const res = await api.get(`/photos/place/${place.id}`);
    if (res.data.length > 0) {
      setHoverPhoto(res.data[0].url);
    } else {
      setHoverPhoto(null);
    }
  } catch {
    setHoverPhoto(null);
  }
};

  const handleNavigate = async (place) => {
  if (!user) {
    setShowLogin(true);
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const res = await api.get("/directions", {
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

      // 🔥 EXTRACT STEPS FROM RAW
      const rawSteps =
        res.data.raw?.routes?.[0]?.legs?.[0]?.steps || [];

      const formattedSteps = res.data.steps.map((step) => ({
      instruction: step.instruction,
      distance: (step.distanceMeters / 1000).toFixed(2) + " km",
      duration: (step.durationSeconds / 60).toFixed(1) + " mins",
      geometry: step.geometry,
      location: step.maneuverLocation
    }));

      setNavigationData({
        distance: res.data.distanceKm.toFixed(2) + " km",
        duration: res.data.durationMinutes.toFixed(0) + " mins",
        steps: formattedSteps,
        destination: place
      });

      setNavigationMode(true);

    } catch (err) {
      console.error("Failed to fetch route", err);
    }
  });
};

const handleReRoute = async (lat, lng) => {
  if (!navigationData?.destination) return;

  try {
    const res = await api.get("/directions", {
      params: {
        fromLat: lat,
        fromLng: lng,
        toLat: navigationData.destination.latitude,
        toLng: navigationData.destination.longitude
      }
    });

    const decoded = polyline.decode(res.data.polyline);
    const latLngs = decoded.map(([lat, lng]) => [lat, lng]);

    setRouteCoords(latLngs);

  } catch (err) {
    console.error("Re-route failed", err);
  }
};

const searchAI = async () => {
  try {
    if (!aiQuery.trim()) return;

    const res = await api.post("/ai/search", {
      query: aiQuery,
      lat: currentLocation?.lat || null,
      lng: currentLocation?.lng || null
    });

    setDisplayedPlaces(res.data);
  } catch (err) {
    console.error("AI search failed", err);
  }
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
  if (navigationMode && navigationData) {
  return (
    <NavigationScreen
    data={navigationData}
    routeCoords={routeCoords}
    onExit={() => {
      setNavigationMode(false);
      setRouteCoords([]);
    }}
    onReRoute={(lat, lng) => {
  handleReRoute(lat, lng);
}}
  />
  );
}

  return (
  <div className="
  h-[calc(100vh-64px)]
  flex
  flex-col md:flex-row
  overflow-hidden
  bg-gradient-to-br
  from-gray-100
  to-gray-200
  dark:from-[#0f172a]
  dark:to-[#111827]
">

    {/* LEFT PANEL - Bottom Sheet */}
   <div
  className={`
    fixed md:relative
    bottom-0 left-0
    w-full md:w-3/5
    bg-white dark:bg-[#0f172a]
    rounded-t-3xl md:rounded-none
    shadow-2xl
    transition-all duration-300
    ${sheetOpen ? "h-[75%]" : "h-[25%]"}
    md:h-full
    z-[5000]
    flex flex-col
  `}
>
  <div
  className="w-12 h-1.5 bg-gray-400 rounded-full mx-auto my-3 cursor-pointer"
  onClick={() => setSheetOpen(!sheetOpen)}
></div>

      {/* CATEGORY + SEARCH HEADER */}
      <div className="p-4 bg-white dark:bg-gray-900 shadow-sm">
        {/* AI Search Bar */}
        <input
          type="text"
          placeholder="Ask anything... (e.g. best PG under 8000)"
          className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
          value={aiQuery}
          onChange={(e) => { setAiQuery(e.target.value)}}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchAI();
            }
          }}
        />

        {/* Category Selector */}
        <div className="relative">
          <div
            className="bg-gray-200 dark:bg-gray-800 rounded-lg p-3 cursor-pointer"
            onClick={() => setCategoryOpen(!categoryOpen)}
          >
            {selectedCategory}
          </div>

          {categoryOpen && (
            <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
              {categories.map((cat) => (
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
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5 scroll-smooth">
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
   <div className="
  w-full md:w-2/5
  h-full md:h-full
  p-0 md:p-6
  flex flex-col
  relative
">

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
            click: () => setSelectedPlace(place),
            mouseover: () => handleHover(place),
            mouseout: () => {
              setHoveredPlace(null);
              setHoverPhoto(null);
            }
          }}
        >
          {hoveredPlace?.id === place.id && (
            <Popup>
              <div className="w-64">

                {hoverPhoto && (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${hoverPhoto}`}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}

                <h3 className="font-semibold text-lg">
                  {place.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {place.category}
                </p>

                <p className="text-sm mt-1">
                  ⭐ {place.averageRating || 0} ({place.reviewCount || 0})
                </p>

                <p className="text-xs mt-2">
                  {place.description?.slice(0, 100)}...
                </p>

              </div>
            </Popup>
          )}
        </Marker>
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
    onClick={() => {
  if (!user) {
    setShowLogin(true);
  } else {
    setShowAddForm(true);
  }
}}
    className="
  fixed md:absolute
  bottom-24 md:bottom-10
  right-6 md:right-10
  z-[9999]
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