import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";


export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { dark, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-4 flex justify-between items-center transition-colors">
      <Link to="/" className="font-bold text-lg">
        FindPlaces
      </Link>

      <div className="flex gap-4 items-center">

        {user?.role === "ADMIN" && (
          <Link to="/admin" className="hover:text-blue-500">
            Admin
          </Link>
        )}

        {!user && (
          <>
            <Link to="/login" className="hover:text-blue-500">
              Login
            </Link>
            <Link to="/register" className="hover:text-blue-500">
              Register
            </Link>
          </>
        )}

        {user && (
          <>
            <span>{user.username}</span>

            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}

        <button
          onClick={toggleTheme}
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {dark ? "Light" : "Dark"}
        </button>

      </div>
    </nav>
  );
}