import { useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", form);

      login(res.data); // ✅ correct

      navigate("/"); // redirect
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      
      <div className="backdrop-blur-lg bg-white/30 p-8 rounded-2xl shadow-xl w-80">
        
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          placeholder="Email"
          className="w-full mb-3 p-2 rounded-lg"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 rounded-lg"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded-xl"
        >
          Login
        </button>

      </div>
    </div>
  );
};

export default Login;