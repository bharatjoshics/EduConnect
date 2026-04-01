import { useEffect, useState, useRef } from "react";
import API from "../../services/api";
import socket from "../../services/socket";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

const StaffChat = () => {
  const { user } = useAuth();
  const { unreadCounts, fetchUnreadCounts } = useChat();

  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user?._id) return;

    socket.connect();
    socket.emit("join", user._id);

    socket.on("typing", ({ from }) => {
      if (selectedSchool && from === selectedSchool._id) {
        setIsTyping(true);
      }
    });

    socket.on("stopTyping", ({ from }) => {
      if (selectedSchool && from === selectedSchool._id) {
        setIsTyping(false);
      }
    });

    socket.on("receiveMessage", (msg) => {
      const senderId = msg.sender._id;

      if (selectedSchool && senderId === selectedSchool._id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      } else {
        fetchUnreadCounts(); // ✅ backend sync
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.disconnect();
    };
  }, [user, selectedSchool]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await API.get("/messages/schools");
        setSchools(res.data || []);
      } catch (err) {
        console.log(err);
      }
    };
    fetchSchools();
  }, []);

  const loadMessages = async (school) => {
    setSelectedSchool(school);

    try {
      const res = await API.get(`/messages/${school._id}`);
      setMessages(res.data || []);
      scrollToBottom();

      fetchUnreadCounts(); // reset handled backend side
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !selectedSchool) return;

    const newMsg = {
      _id: Date.now().toString(),
      text,
      sender: { _id: user._id },
      receiver: { _id: selectedSchool._id },
      createdAt: new Date(), // ✅ FIX
    };

    setMessages((prev) => [...prev, newMsg]);
    setText("");
    scrollToBottom();

    try {
      await API.post("/messages/send", {
        receiver: selectedSchool._id,
        text,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleTyping = (value) => {
    setText(value);

    if (!selectedSchool) return;

    socket.emit("typing", {
      to: selectedSchool._id,
      from: user._id,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        to: selectedSchool._id,
        from: user._id,
      });
    }, 1000);
  };

  return (
    <div className="flex h-[80vh] border rounded">
      {/* Sidebar */}
      <div className="w-1/3 border-r overflow-y-auto">
        {schools.map((s) => (
          <div
            key={s._id}
            onClick={() => loadMessages(s)}
            className={`p-3 cursor-pointer flex justify-between ${
              selectedSchool?._id === s._id ? "bg-gray-100 font-bold" : ""
            }`}
          >
            <span>{s.name}</span>

            {unreadCounts[s._id] > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 rounded-full">
                {unreadCounts[s._id]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col p-4">
        {selectedSchool ? (
          <>
            <h2 className="font-bold mb-2">
              Chat with {selectedSchool.name}
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
                  onKeyDown={(e) =>
                    e.key === "Enter" && sendMessage()
                  }
                />

                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-4 ml-2 rounded"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <p>Select a school</p>
        )}
      </div>
    </div>
  );
};

export default StaffChat;