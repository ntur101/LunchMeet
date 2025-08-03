import { Link } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";
import { useEffect } from "react";

const mockChats = [
  { chatId: "sarah-m", name: "Sarah M.", lastMessage: "I've accepted your trade offer!", timestamp: "10:40 AM" },
  { chatId: "mike-chen", name: "Mike Chen", lastMessage: "I would like to offer you a sandwhich...", timestamp: "Yesterday" },
  { chatId: "jessica-l", name: "Jessica L.", lastMessage: "Is the salad still available?", timestamp: "Yesterday" },
  { chatId: "alex-k", name: "Alex K.", lastMessage: "Perfect! I'll be there at 1 PM", timestamp: "Monday" },
];

function ChatList() {
  const { hasNewMessage } = useNotification();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Chats</h2>
      {mockChats.map((chat) => {
        const isSarah = chat.chatId === "sarah-m";
        const shouldHighlight = isSarah && hasNewMessage;
        
        return (
          <Link
            to={`/chat/${chat.chatId}`}
            key={chat.chatId}
            className="block p-4 mb-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className={`${shouldHighlight ? 'font-bold' : 'font-semibold'} text-gray-900`}>
                  {chat.name}
                </div>
                <div className={`text-sm text-gray-600 mt-1 ${shouldHighlight ? 'font-semibold' : ''}`}>
                  {chat.lastMessage}
                </div>
              </div>
              <div className="text-xs text-gray-400 ml-2">{chat.timestamp}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default ChatList;
