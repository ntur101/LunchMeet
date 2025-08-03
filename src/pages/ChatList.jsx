import { Link } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { listenToChatMetadata, listenToReadStatus, formatTimestamp } from "../lib/chatUtils";

const chatConfigs = [
  { chatId: "kieran-m", name: "Kieran M." },
  { chatId: "mike-chen", name: "Mike Chen" },
  { chatId: "jessica-l", name: "Jessica L." },
  { chatId: "alex-k", name: "Alex K." },
];

function ChatList() {
  const { hasNewMessage } = useNotification();
  const { user } = useAuth();
  const [chatsData, setChatsData] = useState({});
  const [unreadStatus, setUnreadStatus] = useState({});

  useEffect(() => {
    if (!user) return;

    const unsubscribeFunctions = [];

    // Listen to metadata for each chat
    chatConfigs.forEach(({ chatId }) => {
      // Listen to chat metadata (last message)
      const unsubscribeMetadata = listenToChatMetadata(chatId, (metadata) => {
        setChatsData(prev => ({
          ...prev,
          [chatId]: metadata
        }));
      });

      // Listen to unread status
      const unsubscribeUnread = listenToReadStatus(chatId, user.uid, (hasUnread) => {
        setUnreadStatus(prev => ({
          ...prev,
          [chatId]: hasUnread
        }));
      });

      unsubscribeFunctions.push(unsubscribeMetadata, unsubscribeUnread);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [user]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Chats</h2>
      {chatConfigs.map((chatConfig) => {
        const metadata = chatsData[chatConfig.chatId];
        const hasUnread = unreadStatus[chatConfig.chatId];
        const isSarah = chatConfig.chatId === "sarah-m";
        const shouldHighlight = (isSarah && hasNewMessage) || hasUnread;
        
        return (
          <Link
            to={`/chat/${chatConfig.chatId}`}
            key={chatConfig.chatId}
            className="block p-4 mb-2 border border-gray-300 rounded hover:bg-gray-100 relative"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className={`${shouldHighlight ? 'font-bold' : 'font-semibold'} text-gray-900 flex items-center`}>
                  {chatConfig.name}
                  {hasUnread && (
                    <div className="ml-2 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
                <div className={`text-sm text-gray-600 mt-1 ${shouldHighlight ? 'font-semibold' : ''} truncate`}>
                  {metadata?.lastMessage || "No messages yet"}
                </div>
              </div>
              <div className="text-xs text-gray-400 ml-2">
                {metadata?.updatedAt ? formatTimestamp(metadata.updatedAt) : ""}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default ChatList;
