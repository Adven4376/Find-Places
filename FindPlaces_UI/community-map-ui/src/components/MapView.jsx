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

const currentLocationIcon = new L.divIcon({
  className: "custom-current-location",
  html: `
    <div class="relative flex h-10 w-10 items-center justify-center">
      <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-60"></span>
      <svg class="relative w-8 h-8 text-emerald-600 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40], // Anchor at bottom center of the pin
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
  const [travelMode, setTravelMode] = useState("DRIVE"); // Options: DRIVE, TWO_WHEELER, WALK

  const [sheetOpen, setSheetOpen] = useState(false);

  // Global Map Search state
  const [searchMode, setSearchMode] = useState("db"); // 'db' or 'global'
  const [globalQuery, setGlobalQuery] = useState("");
  const [globalPlaces, setGlobalPlaces] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  const [aiQuery, setAiQuery] = useState("");

  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [hoverPhoto, setHoverPhoto] = useState(null);

  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const activePlaces = searchMode === "db" ? displayedPlaces : globalPlaces;

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
    if (!navigator.geolocation) return;

    // 1️⃣ Get location immediately
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => console.error("Initial location error:", err),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );

    // 2️⃣ Start watching location changes
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => console.error("Watch error:", err),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);

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

  const handleNavigate = async (place, mode = travelMode) => {
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
            toLng: place.longitude,
            mode: mode
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
          toLng: navigationData.destination.longitude,
          mode: travelMode
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

  const searchGlobalMap = async () => {
    if (!globalQuery.trim()) return;
    setIsSearchingGlobal(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(globalQuery)}&limit=15`);
      const data = await res.json();

      const formatted = data.map((item) => ({
        id: "geo-" + item.place_id,
        name: item.name || item.display_name.split(",")[0],
        category: item.type ? item.type.toUpperCase() : "MAP PLACE",
        description: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        isGlobal: true,
      }));
      setGlobalPlaces(formatted);
    } catch (err) {
      console.error("Global search failed:", err);
    } finally {
      setIsSearchingGlobal(false);
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
        travelMode={travelMode}
        onTravelModeChange={(mode) => {
          setTravelMode(mode);
          handleNavigate(navigationData.destination, mode);
        }}
      />
    );
  }

  return (
    <div className="
  h-screen
  pt-[80px] md:pt-[100px]
  pb-0 md:pb-6
  px-0 md:px-6
  gap-0 md:gap-6
  flex
  flex-col md:flex-row
  overflow-hidden
  bg-gradient-to-br
  from-gray-100
  to-gray-200
  dark:from-[#0f172a]
  dark:to-[#111827]
  relative
">

      {/* LEFT PANEL - Bottom Sheet */}
      <div
        className={`
    absolute md:relative
    bottom-0 left-0
    w-full md:w-[45%] lg:w-[35%]
    bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-3xl
    rounded-t-3xl md:rounded-3xl
    shadow-[0_-10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_0_40px_rgba(0,0,0,0.4)]
    border-t md:border border-gray-200 dark:border-white/10
    transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
    ${sheetOpen ? "translate-y-0 h-[85vh] md:h-full pb-20 md:pb-0" : "translate-y-[calc(100%-80px)] h-[85vh] md:translate-y-0 md:h-full"}
    z-[5100] md:z-[5000]
    flex flex-col
    overflow-hidden
  `}
      >
        <div
          className="w-16 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-4 mb-2 cursor-pointer hover:bg-gray-400 transition-colors shrink-0 md:hidden"
          onClick={() => setSheetOpen(!sheetOpen)}
        ></div>

        {/* CATEGORY + SEARCH HEADER */}
        <div className="px-6 pb-2">

          {/* TAB TOGGLE (Segmented Control) */}
          <div className="flex p-1 mb-4 bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl shadow-inner border border-gray-200/50 dark:border-white/5">
            <button
              onClick={() => setSearchMode("db")}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${searchMode === "db"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md scale-[1.02]"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
            >
              Local Database
            </button>
            <button
              onClick={() => setSearchMode("global")}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${searchMode === "global"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md scale-[1.02]"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
            >
              Globe Search
            </button>
          </div>

          {searchMode === "db" ? (
            <div className="space-y-3">
              {/* AI Search Bar */}
              <input
                type="text"
                placeholder="Ask anything... (e.g. best PG under 8000)"
                className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-black/30 text-gray-900 dark:text-white border border-gray-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
                value={aiQuery}
                onChange={(e) => { setAiQuery(e.target.value) }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchAI();
                }}
              />

              {/* Category Selector */}
              <div className="relative">
                <div
                  className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-black/30 text-gray-900 dark:text-white border border-gray-200 dark:border-white/5 shadow-sm cursor-pointer flex justify-between items-center transition-all hover:bg-white/80 dark:hover:bg-black/50"
                  onClick={() => setCategoryOpen(!categoryOpen)}
                >
                  <span className="font-medium">{selectedCategory}</span>
                  <span className="text-gray-400 text-xs">▼</span>
                </div>

                {categoryOpen && (
                  <div className="absolute mt-2 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-white/10 max-h-60 overflow-y-auto z-50 py-2">
                    {categories.map((cat) => (
                      <div
                        key={cat}
                        onClick={() => handleCategorySelect(cat)}
                        className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700/50 cursor-pointer font-medium text-gray-700 dark:text-gray-200 transition-colors"
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search world map... (e.g. Eiffel Tower)"
                className="flex-1 px-4 py-3 rounded-2xl bg-white/50 dark:bg-black/30 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchGlobalMap();
                }}
              />
              <button
                onClick={searchGlobalMap}
                className={`text-white px-6 rounded-2xl transition-all font-bold text-sm shadow-md ${isSearchingGlobal ? 'bg-blue-400 cursor-not-allowed scale-95' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30 hover:scale-105 active:scale-95'
                  }`}
                disabled={isSearchingGlobal}
              >
                {isSearchingGlobal ? '...' : 'Search'}
              </button>
            </div>
          )}

        </div>

        {/* SCROLLABLE PLACE LIST */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 pt-4 custom-scrollbar">
          {activePlaces.map((place) => (
            <div
              key={place.id}
              onClick={() => setSelectedPlace(place)}
              className="
            group
            bg-white dark:bg-white/5
            border border-gray-100 dark:border-white/10
            rounded-2xl
            p-5
            shadow-sm
            hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5
            hover:-translate-y-1
            transition-all duration-300
            cursor-pointer
            relative
            overflow-hidden
            "
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/50 dark:from-white/0 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                  {place.name}
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-500 dark:text-emerald-400 mb-2">
                  {place.category}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {place.description}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* RIGHT PANEL - MAP */}
      <div className="
  flex-1
  h-full
  p-0 md:p-0
  flex flex-col
  relative
">

        {/* Rounded Map Container */}
        <div className="
    flex-1
    rounded-none md:rounded-3xl
    overflow-hidden
    border border-transparent md:border-gray-200 md:dark:border-white/10
    md:shadow-2xl
    bg-[#e5e7eb] dark:bg-[#0b1120]
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

            <AutoZoom places={activePlaces} />

            <MarkerClusterGroup chunkedLoading>
              {activePlaces.map((place) => (
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
              <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
                <Popup>You are here</Popup>
              </Marker>
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
  bottom-[100px] md:bottom-10
  right-6 md:right-10
  z-[6000]
  bg-gradient-to-r from-blue-500 to-indigo-600
  text-white
  w-14 h-14 flex items-center justify-center text-3xl pb-1
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