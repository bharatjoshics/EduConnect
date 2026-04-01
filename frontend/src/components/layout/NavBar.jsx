import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

const NavBar = ({ children }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const { user, logout } = useAuth();

  const { totalUnread, unreadCounts } = useChat();


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Upload", path: "/upload" },
    { name: "Received Files", path: "/received" },
    { name: "Your Uploaded Files", path: "/files" },
  ];

  if (user?.role === "staff" || user?.role === "school") {
    navItems.push({ name: "Chat", path: "/chat" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">

      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center p-4 bg-white/30 backdrop-blur-lg shadow">
        <button onClick={() => setOpen(!open)} className="text-xl">☰</button>

        <div className="ml-auto flex items-center gap-2">
          {!token ? (
            <>
              <Link to="/login" className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Login</Link>
              <Link to="/register" className="text-sm bg-green-600 text-white px-3 py-1 rounded">Register</Link>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-700">{user.role}</span>
              <button onClick={handleLogout} className="text-sm bg-red-600 text-white px-3 py-1 rounded">Logout</button>
            </>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex md:p-6 gap-6">
        {/* Sidebar */}
        <div className={`fixed md:relative top-0 left-0 h-full md:h-[calc(100vh-3rem)] w-64 backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl p-6 shadow-xl transform transition-transform duration-300 z-50 flex flex-col ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
          <h2 className="font-bold text-xl mb-8">EduConnect</h2>

          <nav className="flex flex-col space-y-3 text-gray-700 font-medium">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-2 rounded-xl flex justify-between items-center transition ${
                    isActive ? "bg-white/50 shadow" : "hover:bg-white/40"
                  }`}
                >
                  <span>{item.name}</span>

                  {/* ✅ GLOBAL BADGE */}
                  {item.name === "Chat" && Number(totalUnread) > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {totalUnread > 10 ? "10+" : totalUnread}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth */}
          <div className="mt-auto pt-6 border-t border-white/30">
            {!token ? (
              <div className="flex flex-col gap-2">
                <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center">Login</Link>
                <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg text-center">Register</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-700 text-center">
                  Logged in as <b>{user.name}</b>
                </span>
                <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Overlay */}
        {open && (
          <div className="fixed inset-0 bg-black/30 md:hidden" onClick={() => setOpen(false)} />
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col">
          
          <div className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl p-6 shadow-xl min-h-[calc(100vh-3rem)]">
            {children}
          </div>
          
          {/* ✅ Footer */}
          <footer className="mt-4 text-center text-sm text-gray-700">
            Developed with ❤️ by{" "}
            <a href="#" className="font-semibold underline hover:text-blue-600">
              Bharat Joshi
            </a>
          </footer>
        
        </div>
      </div>
    </div>
  );
};

export default NavBar;