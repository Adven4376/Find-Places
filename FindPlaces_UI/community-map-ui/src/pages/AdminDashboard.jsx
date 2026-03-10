import { useEffect, useState } from "react";
import api from "../api/axios";


export default function AdminDashboard() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    const res = await api.get("/api/admin/places/pending");
    setPending(res.data);
  };

  const approve = async (id) => {
    await api.post(`/api/admin/places/${id}/approve`);
    fetchPending();
  };

  const reject = async (id) => {
    await api.post(`/api/admin/places/${id}/reject`);
    fetchPending();
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Pending Places</h2>

      {pending.map((p) => (
        <div key={p.id} className="border p-4 flex justify-between">
          <div>
            <h3 className="font-semibold">{p.name}</h3>
            <p>{p.category}</p>
          </div>

          <div className="space-x-2">
            <button
              onClick={() => approve(p.id)}
              className="bg-green-500 px-3 py-1 text-white rounded"
            >
              Approve
            </button>

            <button
              onClick={() => reject(p.id)}
              className="bg-red-500 px-3 py-1 text-white rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}