import { useEffect, useState, useRef } from "react";
import API from "../../services/api";
import socket from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

const SchoolChat = () => {
  const { user } = useAuth();

  const [staff, setStaff] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const staffRef = useRef(null); // ✅ FIX for stale state

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ Keep staff in ref (avoids re-running socket effect)
  useEffect(() => {
    staffRef.current = staff;
  }, [staff]);

  // ✅ SOCKET CONNECTION (RUN ONLY ONCE PER USER)
  useEffect(() => {
    if (!user?._id) return;

    socket.connect();
    socket.emit("join", user._id);

    socket.on("typing", ({ from }) => {
      if (staffRef.current && from === staffRef.current._id) {
        setIsTyping(true);
      }
    });

    socket.on("stopTyping", ({ from }) => {
      if (staffRef.current && from === staffRef.current._id) {
        setIsTyping(false);
      }
    });

    socket.on("receiveMessage", (msg) => {
      if (staffRef.current && msg.sender._id === staffRef.current._id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.disconnect();
    };
  }, [user]); // ✅ FIXED (no staff dependency)

  // ✅ FETCH CHAT (SEPARATE EFFECT)
  useEffect(() => {
    if (!user?._id) return;

    const fetchChat = async () => {
      try {
        const staffRes = await API.get("/messages/staff");
        if (!staffRes.data) return;

        setStaff(staffRes.data);

        const msgRes = await API.get(`/messages/${staffRes.data._id}`);
        setMessages(msgRes.data || []);

        scrollToBottom();
      } catch (err) {
        console.log(err);
      }
    };

    fetchChat();
  }, [user]);

  const sendMessage = async () => {
    if (!text.trim() || !staff) return;

    const newMsg = {
      _id: Date.now().toString(),
      text,
      sender: { _id: user._id },
      receiver: { _id: staff._id },
      createdAt: new Date(), // ✅ timestamp fix
    };

    setMessages((prev) => [...prev, newMsg]);
    setText("");
    scrollToBottom();

    try {
      await API.post("/messages/send", {
        receiver: staff._id,
        text,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleTyping = (value) => {
    setText(value);

    if (!staff) return;

    socket.emit("typing", { to: staff._id, from: user._id });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { to: staff._id, from: user._id });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[80vh] border rounded p-4">
      <h2 className="font-bold mb-2">
        Chat with {staff?.name || "Staff"}
      </h2>

      <div className="flex-1 overflow-y-auto space-y-2 mb-2">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`p-2 rounded max-w-[60%] ${
              msg.sender._id === user._id
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-300"
            }`}
          >
            <div>{msg.text}</div>

            <div className="text-[10px] opacity-70 mt-1 text-right">
              {msg.createdAt &&
                new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="flex flex-col">
        {isTyping && (
          <p className="text-sm text-gray-500 italic">Typing...</p>
        )}

        <div className="flex">
          <input
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            autoFocus
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 ml-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolChat;