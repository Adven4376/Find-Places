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

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (place) fetchDetails();
  }, [place]);

  // Lock background scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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
        if (!user) {
      setShowLogin(true);
      return;
    }
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
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {previewImage && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000]"
    onClick={() => setPreviewImage(null)}
  >
    <img
      src={previewImage}
      alt=""
      className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl"
    />
  </div>
)}

      {/* SIDE DRAWER */}
      <div
        className="
          fixed
          top-0
          right-0
          h-full
          w-[420px]
          bg-white dark:bg-[#0b1120]
          border-l border-gray-200 dark:border-white/10
          shadow-2xl
          overflow-y-auto
          z-[9999]
          p-8
          transition-transform duration-300
        "
      >
        <button
          onClick={onClose}
          className="text-red-500 mb-6 font-semibold hover:underline"
        >
          Close
        </button>

        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {place.name}
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {place.description}
        </p>

        <div className="mb-4 font-semibold text-yellow-500">
          ⭐ Average Rating: {average ? average.toFixed(1) : "0.0"}
        </div>

        <button
          onClick={() => onNavigate(place)}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-[1.02] text-white py-3 rounded-lg mb-6 transition-all"
        >
          Navigate
        </button>

        {/* Photos */}
        {photos.length > 0 && (
  <>
    <h3 className="font-semibold mb-3">Photos</h3>

    <div className="grid grid-cols-2 gap-4 mb-6">
      {photos.map(photo => (
        <img
          key={photo.id}
          src={`http://localhost:9090${photo.url}`}
          alt=""
          onClick={() =>
            setPreviewImage(`http://localhost:9090${photo.url}`)
          }
          className="rounded-xl w-full h-40 object-contain bg-black/10 cursor-pointer hover:scale-105 transition-all duration-300"
        />
      ))}
    </div>
  </>
)}

        {/* Reviews */}
        <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">
          Reviews
        </h3>

        <div className="space-y-3 mb-6">
          {reviews.length === 0 && (
            <p className="text-sm text-gray-500">
              No reviews yet.
            </p>
          )}

          {reviews.map(r => (
            <div
              key={r.id}
              className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-xl"
            >
              <p className="font-medium">{r.username}</p>
              <p className="text-yellow-500 text-sm">⭐ {r.rating}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {r.comment}
              </p>
            </div>
          ))}
        </div>

        {/* Add Review */}
        {user && (
          <form
            onSubmit={handleSubmit(submitReview)}
            className="space-y-4"
          >
            <select
              {...register("rating")}
              className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700"
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
              className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />

            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition">
              Submit Review
            </button>
          </form>
        )}
      </div>
    </>
  );
}