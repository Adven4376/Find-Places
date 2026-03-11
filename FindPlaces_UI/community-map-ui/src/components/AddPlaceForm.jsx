import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents
} from "react-leaflet";
import L from "leaflet";
import api from "../api/axios";
import "leaflet/dist/leaflet.css";

function LocationPicker({ position, setPosition, setValue }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      setValue("latitude", lat);
      setValue("longitude", lng);
    }
  });

  return position ? (
    <Marker
      position={[position.lat, position.lng]}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const lat = e.target.getLatLng().lat;
          const lng = e.target.getLatLng().lng;
          setPosition({ lat, lng });
          setValue("latitude", lat);
          setValue("longitude", lng);
        }
      }}
    />
  ) : null;
}

export default function AddPlaceForm({ onClose, onSuccess }) {
  const { register, handleSubmit, setValue } = useForm();
  const [position, setPosition] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition({ lat, lng });
        setValue("latitude", lat);
        setValue("longitude", lng);
        setLoadingLocation(false);
      },
      () => {
        setLoadingLocation(false);
      }
    );
  }, [setValue]);

  const onSubmit = async (data) => {
    try {

      // 1️⃣ Create Place
      const res = await api.post("/places", {
        name: data.name,
        category: data.category.toUpperCase().replace(/\s+/g, "_"),
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        description: data.description
      });

      const createdPlace = res.data;

      // 2️⃣ Upload Photo (if selected)
      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);

        await api.post(
          `/places/${createdPlace.id}/photos`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        );
      }

      onSuccess();
      onClose();

    } catch (err) {
      console.error(err);
      alert("Failed to add place");
    }
  };

  return (
    <div className="
      fixed inset-0
      bg-gray-900/60 dark:bg-black/80 backdrop-blur-md
      flex items-center justify-center
      z-[6000] p-4
    ">
      <div className="
        relative
        bg-white/90 dark:bg-[#0b1120]/90 backdrop-blur-2xl
        rounded-3xl
        shadow-[0_0_50px_rgba(0,0,0,0.2)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]
        border border-white/20 dark:border-white/10
        w-full md:w-[600px]
        max-h-[90vh]
        overflow-y-auto custom-scrollbar
        p-8
      ">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-red-500 font-bold transition-colors text-xl"
        >
          ✕
        </button>

        <div className="text-center mb-6 space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Publish a Location
          </h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Drag the pin to select coordinates, then fill out the details.
          </p>
        </div>

        {loadingLocation && (
          <div className="flex justify-center items-center py-4">
            <span className="text-sm font-semibold text-blue-500/80 animate-pulse">
              📍 Acquiring GPS signal...
            </span>
          </div>
        )}

        {position && (
          <div className="h-[200px] mb-6 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-inner brightness-95 dark:brightness-90">
            <MapContainer
              center={[position.lat, position.lng]}
              zoom={15}
              className="h-full w-full"
            >
              <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <LocationPicker
                position={position}
                setPosition={setPosition}
                setValue={setValue}
              />
            </MapContainer>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <input
            {...register("name")}
            placeholder="Place Name"
            className="w-full px-4 py-3 rounded-xl bg-gray-100/80 dark:bg-black/30 border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium shadow-sm"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              {...register("category")}
              placeholder="Category (e.g. Park)"
              className="w-full px-4 py-3 rounded-xl bg-gray-100/80 dark:bg-black/30 border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium shadow-sm"
            />
            <div className="flex bg-gray-100/80 dark:bg-black/30 rounded-xl px-4 items-center border border-gray-200 dark:border-white/5 shadow-sm">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              {...register("latitude")}
              placeholder="Latitude"
              className="w-full px-4 py-3 rounded-xl bg-gray-100/80 dark:bg-black/30 border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-mono shadow-sm"
            />
            <input
              {...register("longitude")}
              placeholder="Longitude"
              className="w-full px-4 py-3 rounded-xl bg-gray-100/80 dark:bg-black/30 border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-mono shadow-sm"
            />
          </div>

          <textarea
            {...register("description")}
            placeholder="Share what makes this place special..."
            className="w-full px-4 py-3 rounded-xl bg-gray-100/80 dark:bg-black/30 border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium shadow-sm min-h-[100px] resize-none"
          />

          {/* Buttons */}
          <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-white font-bold rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Submit Place
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}