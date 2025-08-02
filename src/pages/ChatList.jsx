import { Link } from "react-router-dom";

const mockChats = [
  { chatId: "seller1-buyer1", lastMessage: "Sure, let's discuss!" },
  { chatId: "seller2-buyer2", lastMessage: "Hi, I'm interested in your item!" },
];

function ChatList() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Chats</h2>
      {mockChats.map((chat) => (
        <Link
          to={`/chat/${chat.chatId}`}
          key={chat.chatId}
          className="block p-4 mb-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          <div className="font-semibold">{chat.chatId}</div>
          <div className="text-sm text-gray-600">{chat.lastMessage}</div>
        </Link>
      ))}
    </div>
  );
}

export default ChatList;
