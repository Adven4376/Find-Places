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
      await api.post("/api/places", {
        name: data.name,
        category: data.category.toUpperCase().replace(/\s+/g, "_"),
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        description: data.description
      });

      onSuccess();
      onClose();
    } catch {
      alert("Failed to add place");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
      <div className="bg-white dark:bg-gray-800 w-[500px] p-6 rounded-xl shadow-xl">

        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Add New Place
        </h2>

        {loadingLocation && (
          <p className="text-sm text-blue-500 mb-2">
            Detecting location...
          </p>
        )}

        {position && (
          <div className="h-64 mb-4 rounded overflow-hidden">
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

          <input
            {...register("name")}
            placeholder="Place Name"
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          />

          <input
            {...register("category")}
            placeholder="Category"
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          />

          <input
            {...register("latitude")}
            placeholder="Latitude"
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          />

          <input
            {...register("longitude")}
            placeholder="Longitude"
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          />

          <textarea
            {...register("description")}
            placeholder="Description"
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          />

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Submit
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}