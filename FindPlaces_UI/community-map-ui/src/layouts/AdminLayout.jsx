import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";


export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}