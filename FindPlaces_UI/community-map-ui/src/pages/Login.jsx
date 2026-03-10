import { useForm } from "react-hook-form";
import api from "../api/axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const { register, handleSubmit } = useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/api/auth/login", data);
      login(res.data.token);
      navigate("/");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          Login
        </h2>

        <input
          {...register("username")}
          placeholder="Username"
          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
        />

        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Login
        </button>
      </form>
    </div>
  );
}