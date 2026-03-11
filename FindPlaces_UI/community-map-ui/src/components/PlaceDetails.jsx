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
          top-4
          bottom-4
          right-4
          w-[95%] md:w-[420px]
          bg-white/80 dark:bg-[#0b1120]/80
          backdrop-blur-3xl
          border border-white/20 dark:border-white/10
          rounded-3xl
          shadow-2xl
          overflow-y-auto
          z-[9999]
          p-6 md:p-8
          custom-scrollbar
          transition-transform duration-300
        "
      >
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-red-500 mb-6 font-bold tracking-wider text-sm uppercase transition-colors"
        >
          ✕ Close
        </button>

        <h2 className="text-3xl font-extrabold mb-2 tracking-tight text-gray-900 dark:text-white">
          {place.name}
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
          {place.description}
        </p>

        <div className="mb-6 font-semibold inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-full text-sm">
          <span>⭐</span>
          <span>Average Rating: {average ? average.toFixed(1) : "0.0"}</span>
        </div>

        <button
          onClick={() => onNavigate(place)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] text-white font-bold py-3.5 rounded-xl mb-8 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>📍</span> Navigate Here
        </button>

        {/* Photos */}
        {photos.length > 0 && (
          <>
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200 tracking-tight">Gallery</h3>

            <div className="columns-2 gap-3 mb-8 space-y-3">
              {photos.map(photo => (
                <img
                  key={photo.id}
                  src={`http://localhost:9090${photo.url}`}
                  alt=""
                  onClick={() =>
                    setPreviewImage(`http://localhost:9090${photo.url}`)
                  }
                  className="rounded-2xl w-full object-cover shadow-sm bg-gray-100 dark:bg-black/20 cursor-pointer hover:shadow-xl hover:scale-[1.03] transition-all duration-300 break-inside-avoid border border-white/20 dark:border-white/5"
                />
              ))}
            </div>
          </>
        )}

        {/* Reviews */}
        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200 tracking-tight">
          Community Reviews
        </h3>

        <div className="space-y-4 mb-8">
          {reviews.length === 0 && (
            <div className="text-center p-6 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
              <p className="text-sm text-gray-500 font-medium">No reviews yet. Be the first!</p>
            </div>
          )}

          {reviews.map(r => (
            <div
              key={r.id}
              className="bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/5 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-gray-900 dark:text-white">{r.username}</p>
                <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  ⭐ <span className="pt-0.5">{r.rating}</span>
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {r.comment}
              </p>
            </div>
          ))}
        </div>

        {/* Add Review */}
        {user && (
          <form
            onSubmit={handleSubmit(submitReview)}
            className="space-y-4 bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30"
          >
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-2">Leave a Rating</h4>
            
            <select
              {...register("rating")}
              className="w-full border border-gray-200 dark:border-white/5 p-3 rounded-xl bg-white/80 dark:bg-black/40 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            >
              <option value="5">5 ⭐ Amazing</option>
              <option value="4">4 ⭐ Good</option>
              <option value="3">3 ⭐ Average</option>
              <option value="2">2 ⭐ Poor</option>
              <option value="1">1 ⭐ Terrible</option>
            </select>

            <textarea
              {...register("comment")}
              placeholder="Share your experience..."
              className="w-full border border-gray-200 dark:border-white/5 p-3 rounded-xl bg-white/80 dark:bg-black/40 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all min-h-[100px] resize-none"
            />

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98]">
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </>
  );
}