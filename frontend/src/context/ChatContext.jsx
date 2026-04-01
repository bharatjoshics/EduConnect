import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";
import socket from "../services/socket";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();

  const [unreadCounts, setUnreadCounts] = useState({});

  // ✅ Fetch unread from backend
  const fetchUnreadCounts = async () => {
    try {

      const res = await API.get("/messages/unread");

      const map = {};

      res.data.forEach(item => {
        const key = item._id?.toString();
        map[key] = item.count;
      });


      setUnreadCounts(map);

    } catch (err) {
      console.log("❌ FETCH ERROR:", err);
    }
  };

  // ✅ Calculate total dynamically
  const totalUnread = Object.values(unreadCounts || {}).reduce(
    (sum, val) => sum + val,
    0
  );

  // ✅ Socket listener (global)
  useEffect(() => {
    if (!user?._id) return;


    socket.connect();
    socket.emit("join", user._id);

    socket.on("receiveMessage", (msg) => {
      fetchUnreadCounts();
    });

    return () => {
      console.log("❌ Socket disconnected");
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, [user]);

  // ✅ Initial fetch + polling
  useEffect(() => {
    if (!user?._id) return;

    fetchUnreadCounts();

    const interval = setInterval(() => {
      fetchUnreadCounts();
    }, 5000); // every 5 sec

    return () => clearInterval(interval);
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        unreadCounts,
        totalUnread,
        fetchUnreadCounts,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);