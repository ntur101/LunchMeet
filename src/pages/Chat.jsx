import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { X } from 'lucide-react';

function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  
  // Map chatId to display names
  const chatNames = {
    "sarah-m": "Sarah M.",
    "mike-chen": "Mike Chen", 
    "jessica-l": "Jessica L.",
    "alex-k": "Alex K."
  };
  
  const displayName = chatNames[chatId] || chatId;
  
  // Different message sets based on chatId
  const getInitialMessages = (chatId) => {
    if (chatId === "sarah-m") {
      return [
        { id: 1, text: "I've accepted your trade offer!", sender: "other", timestamp: "10:30 AM" },
      ];
    }
    // Default messages for other chats
    return [
      { id: 1, text: "Hey! Is this item still available?", sender: "other", timestamp: "10:30 AM" },
      { id: 2, text: "Yes it is! Made it fresh this morning 😊", sender: "me", timestamp: "10:32 AM" },
      { id: 3, text: "Perfect! Can we meet up around noon?", sender: "other", timestamp: "10:35 AM" },
      { id: 4, text: "Sure! How about the student center food court?", sender: "me", timestamp: "10:37 AM" },
      { id: 5, text: "Sounds good! See you there", sender: "other", timestamp: "10:40 AM" },
    ];
  };
  
  const [messages, setMessages] = useState(getInitialMessages(chatId));
  const [newMessage, setNewMessage] = useState("");
  const [responseIndex, setResponseIndex] = useState(0); // Track which response to use next
  const [isTyping, setIsTyping] = useState(false); // Track if Sarah is typing
  const [isVisible, setIsVisible] = useState(false); // For slide animation
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Trigger slide-up animation when component mounts
    setIsVisible(true);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        text: newMessage,
        sender: "me",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, message]);
      setNewMessage("");
      
      // Auto-response for Sarah's chat after 3 seconds
      if (chatId === "sarah-m") {
        // Wait 1.5 seconds before showing typing indicator
        setTimeout(() => {
          setIsTyping(true); // Show typing indicator
        }, 1500);
        
        setTimeout(() => {
          const responses = [
            "lets meet outside the library does 9:30 work?",
            "Chur ma bro see you then",
            "Perfect! See you soon",
            "Sounds good to me!",
            "Thanks! You're the best 🙌"
          ];
          
          // Use sequential responses instead of random
          const response = responses[responseIndex % responses.length];
          setResponseIndex(prev => prev + 1);
          
          const autoMessage = {
            id: Date.now(), // Use timestamp for unique ID
            text: response,
            sender: "other",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, autoMessage]);
          setIsTyping(false); // Hide typing indicator
        }, 5000);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

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
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'me'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="mb-4 flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white text-gray-800 rounded-bl-none shadow-sm">
              <div className="flex items-center space-x-2 pl-2">
                <span className="text-sm text-gray-500">{displayName} is typing</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDuration: '0.6s', transform: 'translateY(-4px)'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s', animationDuration: '0.6s', transform: 'translateY(-4px)'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s', animationDuration: '0.6s', transform: 'translateY(-4px)'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} className="px-6">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
