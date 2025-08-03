import { createContext, useContext, useState } from 'react';

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

  return (
    <NotificationContext.Provider 
      value={{ 
        hasNewMessage, 
        triggerNewMessage, 
        clearNewMessage 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
