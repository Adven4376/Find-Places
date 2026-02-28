import { useEffect, useState } from "react";
import api from "../api/axios";
import MapView from "../components/MapView";
import Pagination from "../components/Pagination";

export default function MapPage() {
  const [places, setPlaces] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchPlaces(page);
  }, [page]);

  const fetchPlaces = async (pageNumber) => {
    try {
      const res = await api.get(`/api/places?page=${pageNumber}&size=20`);
      setPlaces(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch places", err);
    }
  };

  return (
    <div className="relative h-[calc(100vh-70px)]">
      <MapView places={places} refresh={() => fetchPlaces(page)} />
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}