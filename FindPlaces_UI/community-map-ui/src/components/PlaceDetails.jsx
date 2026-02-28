import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useForm } from "react-hook-form";

export default function PlaceDetails({ place, onClose, onNavigate }) {
  const [photos, setPhotos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const { user } = useContext(AuthContext);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (place) fetchDetails();
  }, [place]);

  const fetchDetails = async () => {
    try {
      const [photoRes, reviewRes, avgRes] = await Promise.all([
        api.get(`/api/places/${place.id}/photos`),
        api.get(`/api/reviews/place/${place.id}`),
        api.get(`/api/reviews/place/${place.id}/average`)
      ]);

      setPhotos(photoRes.data);
      setReviews(reviewRes.data);
      setAverage(avgRes.data);
    } catch (err) {
      console.error("Failed to fetch place details", err);
    }
  };

  const submitReview = async (data) => {
    try {
      await api.post("/api/reviews", {
        placeId: place.id,
        rating: Number(data.rating),
        comment: data.comment
      });
      reset();
      fetchDetails();
    } catch (err) {
      console.error("Review submission failed", err);
    }
  };

  if (!place) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-[3000] transform translate-x-0 transition-transform duration-300 overflow-y-auto">

      <div className="p-5">

        <button
          onClick={onClose}
          className="text-red-500 mb-4 font-semibold hover:underline"
        >
          Close
        </button>

        <h2 className="text-2xl font-bold mb-2">
          {place.name}
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {place.description}
        </p>

        <div className="mb-4 font-semibold">
          ⭐ Average Rating: {average ? average.toFixed(1) : "0.0"}
        </div>

        <button
          onClick={() => onNavigate(place)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mb-5 transition"
        >
          Navigate
        </button>

        {/* Photos */}
        {photos.length > 0 && (
          <>
            <h3 className="font-semibold mb-2">Photos</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {photos.map(photo => (
                <img
                  key={photo.id}
                  src={`http://localhost:9090${photo.url}`}
                  alt=""
                  className="rounded-lg object-cover h-28 w-full"
                />
              ))}
            </div>
          </>
        )}

        {/* Reviews */}
        <h3 className="font-semibold mb-2">Reviews</h3>

        <div className="space-y-3 mb-6">
          {reviews.length === 0 && (
            <p className="text-sm text-gray-500">
              No reviews yet.
            </p>
          )}

          {reviews.map(r => (
            <div
              key={r.id}
              className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg"
            >
              <p className="font-medium">{r.username}</p>
              <p>⭐ {r.rating}</p>
              <p className="text-sm">{r.comment}</p>
            </div>
          ))}
        </div>

        {/* Add Review */}
        {user && (
          <form
            onSubmit={handleSubmit(submitReview)}
            className="space-y-3"
          >
            <select
              {...register("rating")}
              className="w-full border p-2 rounded dark:bg-gray-800"
            >
              <option value="5">5 ⭐</option>
              <option value="4">4 ⭐</option>
              <option value="3">3 ⭐</option>
              <option value="2">2 ⭐</option>
              <option value="1">1 ⭐</option>
            </select>

            <textarea
              {...register("comment")}
              placeholder="Write review..."
              className="w-full border p-2 rounded dark:bg-gray-800"
            />

            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition">
              Submit Review
            </button>
          </form>
        )}

      </div>
    </div>
  );
}