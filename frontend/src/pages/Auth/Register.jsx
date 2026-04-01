import { useState } from "react";
import API from "../../services/api";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "school", // default
  });

  const handleRegister = async () => {
    try {
      await API.post("/auth/register", form);
      alert("Registered successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">

      <div className="backdrop-blur-lg bg-white/30 p-8 rounded-2xl shadow-xl w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        {/* NAME */}
        <input
          placeholder="Name"
          className="w-full mb-3 p-2 rounded-lg"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        {/* EMAIL */}
        <input
          placeholder="Email"
          className="w-full mb-3 p-2 rounded-lg"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 rounded-lg"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {/* ROLE */}
        <select
          className="w-full mb-4 p-2 rounded-lg"
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="school">School</option>
          <option value="staff">Staff</option>
        </select>

        {/* BUTTON */}
        <button
          onClick={handleRegister}
          className="w-full bg-green-600 text-white py-2 rounded-xl"
        >
          Register
        </button>
      </div>

    </div>
  );
};

export default Register;