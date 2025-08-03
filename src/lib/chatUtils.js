import { ref, push, onValue, off, serverTimestamp, query, orderByChild, limitToLast, set } from 'firebase/database';
import { database } from './firebase';

// Send a message to a chat
export const sendMessage = async (chatId, message, senderId, senderName) => {
  try {
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const newMessageRef = await push(messagesRef, {
      text: message,
      senderId: senderId,
      senderName: senderName,
      timestamp: serverTimestamp(),
      createdAt: Date.now() // Fallback timestamp
    });

    // Update chat metadata with last message
    const chatMetaRef = ref(database, `chats/${chatId}/metadata`);
    await set(chatMetaRef, {
      lastMessage: message,
      lastMessageTime: serverTimestamp(),
      lastMessageSender: senderId,
      lastMessageSenderName: senderName,
      updatedAt: Date.now()
    });

    return newMessageRef;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Listen to messages in a chat
export const listenToMessages = (chatId, callback) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  const messagesQuery = query(messagesRef, orderByChild('createdAt'));
  
  onValue(messagesQuery, (snapshot) => {
    const messages = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(messages);
  });

  // Return unsubscribe function
  return () => off(messagesRef);
};

// Update chat metadata (last message, timestamp)
export const updateChatMetadata = async (chatId, lastMessage, participants) => {
  try {
    const chatRef = ref(database, `chats/${chatId}/metadata`);
    await push(chatRef, {
      lastMessage: lastMessage,
      lastMessageTime: serverTimestamp(),
      participants: participants,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating chat metadata:', error);
  }
};

// Get all chats for a user
export const listenToUserChats = (userId, callback) => {
  const chatsRef = ref(database, 'chats');
  
  onValue(chatsRef, (snapshot) => {
    const chats = [];
    snapshot.forEach((childSnapshot) => {
      const chatData = childSnapshot.val();
      // For now, include all chats - in a real app you'd filter by participation
      chats.push({
        chatId: childSnapshot.key,
        ...chatData
      });
    });
    callback(chats);
  });

  return () => off(chatsRef);
};

// Format timestamp for display
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else if (diffInHours < 24 * 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

// Listen to chat metadata for last messages
export const listenToChatMetadata = (chatId, callback) => {
  const metadataRef = ref(database, `chats/${chatId}/metadata`);
  
  const listener = onValue(metadataRef, (snapshot) => {
    const metadata = snapshot.val();
    callback(metadata);
  });

  return () => off(metadataRef, 'value', listener);
};

// Mark chat as read for a user
export const markChatAsRead = async (chatId, userId) => {
  try {
    const readStatusRef = ref(database, `chats/${chatId}/readStatus/${userId}`);
    await set(readStatusRef, {
      lastReadTime: serverTimestamp(),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error marking chat as read:', error);
  }
};

// Listen to read status to determine unread messages
export const listenToReadStatus = (chatId, userId, callback) => {
  const readStatusRef = ref(database, `chats/${chatId}/readStatus/${userId}`);
  const metadataRef = ref(database, `chats/${chatId}/metadata`);
  
  let readStatus = null;
  let metadata = null;
  
  const checkUnreadStatus = () => {
    if (readStatus !== null && metadata !== null) {
      const lastReadTime = readStatus?.timestamp || 0;
      const lastMessageTime = metadata?.updatedAt || 0;
      const hasUnread = lastMessageTime > lastReadTime && metadata?.lastMessageSender !== userId;
      callback(hasUnread);
    }
  };
  
  const readListener = onValue(readStatusRef, (snapshot) => {
    readStatus = snapshot.val();
    checkUnreadStatus();
  });
  
  const metaListener = onValue(metadataRef, (snapshot) => {
    metadata = snapshot.val();
    checkUnreadStatus();
  });

  return () => {
    off(readStatusRef, 'value', readListener);
    off(metadataRef, 'value', metaListener);
  };
};
