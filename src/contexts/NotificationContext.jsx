import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { listenToReadStatus } from '../lib/chatUtils';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [newMessageTimeout, setNewMessageTimeout] = useState(null);
  const [hasAnyUnread, setHasAnyUnread] = useState(false);
  const { user } = useAuth();

  // Monitor unread status across all chats
  useEffect(() => {
    if (!user) return;

    const chatIds = ["kieran-m", "mike-chen", "jessica-l", "alex-k"];
    const unreadStatuses = {};
    const unsubscribeFunctions = [];

    const updateGlobalUnreadStatus = () => {
      const hasUnread = Object.values(unreadStatuses).some(status => status);
      setHasAnyUnread(hasUnread);
    };

    chatIds.forEach(chatId => {
      const unsubscribe = listenToReadStatus(chatId, user.uid, (hasUnread) => {
        unreadStatuses[chatId] = hasUnread;
        updateGlobalUnreadStatus();
      });
      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [user]);

  const triggerNewMessage = () => {
    console.log('triggerNewMessage called');
    // Clear any existing timeout
    if (newMessageTimeout) {
      clearTimeout(newMessageTimeout);
    }

    // Set notification after 3 seconds
    const timeout = setTimeout(() => {
      console.log('Setting hasNewMessage to true');
      setHasNewMessage(true);
    }, 3000);
    
    setNewMessageTimeout(timeout);
  };

  const clearNewMessage = () => {
    setHasNewMessage(false);
    if (newMessageTimeout) {
      clearTimeout(newMessageTimeout);
      setNewMessageTimeout(null);
    }
  };

  // Use Firebase unread status or fallback to old system
  const shouldShowNotification = hasAnyUnread || hasNewMessage;

  return (
    <NotificationContext.Provider 
      value={{ 
        hasNewMessage: shouldShowNotification,
        hasAnyUnread,
        triggerNewMessage, 
        clearNewMessage 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
