import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { X, Send } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage, listenToMessages, formatTimestamp, markChatAsRead } from '../lib/chatUtils';

function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { clearNewMessage } = useNotification();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Clear notification when entering any chat and mark as read
  useEffect(() => {
    clearNewMessage(); // Clear any old-style notifications
    
    // Mark chat as read when user opens it
    if (user && chatId) {
      markChatAsRead(chatId, user.uid);
    }
  }, [chatId, clearNewMessage, user]);

  // Map chatId to display names
  const chatNames = {
    "kieran-m": "Kieran M.",
    "mike-chen": "Mike Chen", 
    "jessica-l": "Jessica L.",
    "alex-k": "Alex K."
  };
  
  const displayName = chatNames[chatId] || chatId;

  // Trigger slide-up animation when component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Listen to messages from Firebase
  useEffect(() => {
    if (!chatId) return;
    
    setIsLoading(true);
    const unsubscribe = listenToMessages(chatId, (firebaseMessages) => {
      setMessages(firebaseMessages);
      setIsLoading(false);
      
      // Mark as read when new messages come in (if user is viewing this chat)
      if (user && firebaseMessages.length > 0) {
        markChatAsRead(chatId, user.uid);
      }
    });

    return unsubscribe;
  }, [chatId, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await sendMessage(chatId, newMessage.trim(), user.uid, user.displayName);
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen transform transition-transform duration-300 ease-out ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      {/* Chat Header */}
      <div className="bg-white border-b p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{displayName}</h2>
          <button 
            onClick={() => navigate('/chats')}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === user?.uid
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === user?.uid ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTimestamp(message.createdAt || message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!user}
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!newMessage.trim() || !user}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
