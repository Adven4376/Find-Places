import { useForm } from "react-hook-form";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await api.post("/api/auth/register", data);
      alert("Registered successfully");
      navigate("/login");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          Register
        </h2>

        <input
          {...register("username")}
          placeholder="Username"
          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
        />

        <input
          {...register("email")}
          placeholder="Email"
          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
        />

        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
        />

        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
          Register
        </button>
      </form>
    </div>
  );
}