import { useAuth } from "../context/AuthContext";
import StaffChat from "../components/chat/StaffChat";
import SchoolChat from "../components/chat/SchoolChat";

const ChatPage = () => {
  const { user } = useAuth();
  return user?.role === "staff" ? <StaffChat /> : <SchoolChat />;
};

export default ChatPage;