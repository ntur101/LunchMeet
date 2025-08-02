import database from "../data/database.json";

// Authentication
export function login(username, password) {
  const user = database.users.find((u) => u.username === username && u.password === password);
  return user ? { success: true, token: "fake-token" } : { success: false, error: "Invalid credentials" };
}

export function signup(username, password) {
  database.users.push({ username, password });
  return { success: true };
}

// Profile Management
export function getUserProfile(username) {
  return database.profiles[username];
}

export function addFoodItem(username, foodItem) {
  // Add to user's inventory
  database.profiles[username].inventory.push(foodItem);
  
  // Also add to global food listings
  const listingItem = {
    ...foodItem,
    seller: username
  };
  database.foodListings.push(listingItem);
  
  console.log(`Food item "${foodItem.title}" added to ${username}'s inventory and global listings`);
  console.log('Updated inventory:', database.profiles[username].inventory);
  
  // In a real app, this would make an API call to persist the data
  // For now, we're just modifying the in-memory database object
}

export function editFoodItem(username, foodId, updatedData) {
  const item = database.profiles[username].inventory.find((item) => item.id === foodId);
  Object.assign(item, updatedData);
}

export function deleteFoodItem(username, foodId) {
  database.profiles[username].inventory = database.profiles[username].inventory.filter((item) => item.id !== foodId);
}

// Food Listings
export function getFoodListings(filters) {
  return database.foodListings; // Ignore filters for simplicity
}

export function getFoodDetails(foodId) {
  return database.foodListings.find((item) => item.id === foodId);
}

// AI Food Extraction
export function extractFoodItems(photo) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: "Pizza", image: "pizza.jpg" },
        { id: 2, title: "Burger", image: "burger.jpg" }
      ]);
    }, 2000); // Simulate 2-second delay
  });
}

// Negotiation
const chats = {};

export function createChat(sellerId, buyerId, offerDetails) {
  const chatId = `${sellerId}-${buyerId}`;
  chats[chatId] = [{ sender: buyerId, message: "Hi, I'm interested in your item!" }];
  return chatId;
}

export function sendMessage(chatId, message) {
  chats[chatId].push({ sender: "buyer", message });
  setTimeout(() => {
    chats[chatId].push({ sender: "seller", message: "Sure, let's discuss!" });
  }, 2000); // Simulate 2-second delay
}

export function getChatMessages(chatId) {
  return chats[chatId];
}

// Notifications
const notifications = [];

export function sendNotification(userId, message) {
  notifications.push({ userId, message });
}

export function getNotifications(userId) {
  return notifications.filter((n) => n.userId === userId);
}

// Helper function to add a test camera-captured item for demonstration
export function addTestCameraItem(username) {
  const testItem = {
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    title: "Test Sandwich",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhbWVyYTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjU1JSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q2FwdHVyZWQ8L3RleHQ+PC9zdmc+",
    confidence: 0.95,
    dateAdded: new Date().toISOString(),
    source: 'camera_capture'
  };
  
  addFoodItem(username, testItem);
  return testItem;
}