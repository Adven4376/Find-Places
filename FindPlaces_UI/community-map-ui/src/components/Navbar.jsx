import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { dark, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="fixed top-0 left-0 right-0 z-[6000] px-4 pt-4 pb-2 p-0 md:p-4 pointer-events-none">
      <nav className="pointer-events-auto max-w-7xl mx-auto bg-white/70 dark:bg-[#0b1120]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-2xl px-6 py-3 flex justify-between items-center transition-all duration-300">
        
        {/* Logo area */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <span className="text-white font-bold text-lg leading-none mt-[-2px]">f</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300">
            FindPlaces
          </span>
        </Link>

        {/* Desktop / Navigation Actions */}
        <div className="flex gap-2 sm:gap-4 items-center">
          {user?.role === "ADMIN" && (
            <Link to="/admin" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              Admin
            </Link>
          )}

          {!user && (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors px-1 sm:px-2">
                Log In
              </Link>
              <Link to="/register" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:scale-105 hover:shadow-lg transition-all">
                Sign Up
              </Link>
            </div>
          )}

          {user && (
            <div className="flex items-center gap-2 sm:gap-3 bg-gray-100 dark:bg-white/10 pl-2 sm:pl-3 pr-1 py-1 rounded-full border border-gray-200 dark:border-white/5">
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[80px] sm:max-w-none truncate">
                {user.username}
              </span>
              <button
                onClick={logout}
                className="bg-white dark:bg-gray-800 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-bold rounded-full shadow-sm transition-all"
              >
                Logout
              </button>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#1e293b] text-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-white/5 shadow-inner"
            title="Toggle theme"
          >
            {dark ? "🌞" : "🌙"}
          </button>
        </div>
      </nav>
    </div>
  );
}