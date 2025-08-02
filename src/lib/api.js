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
  database.profiles[username].inventory.push(foodItem);
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
