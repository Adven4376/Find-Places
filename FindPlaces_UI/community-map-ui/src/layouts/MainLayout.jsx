import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";


export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <Outlet />
    </div>
  );
}