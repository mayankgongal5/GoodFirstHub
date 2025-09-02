/**
 * Utilities for handling real-time functionality
 */
import { client, databases, DATABASES_ID, MESSAGES_COLLECTION_ID } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

// Map of active users by repoId -> { userId: { lastActive, name, email } }
const activeUsersByRepo = new Map();

// Keep track of user activity in a repository
export const recordUserActivity = (repoId, userId, userName, userEmail) => {
  if (!repoId || !userId) return;

  // Get or create the repo's active users map
  if (!activeUsersByRepo.has(repoId)) {
    activeUsersByRepo.set(repoId, new Map());
  }
  
  const repoUsers = activeUsersByRepo.get(repoId);
  
  // Update user activity
  repoUsers.set(userId, {
    lastActive: Date.now(),
    name: userName || 'Unknown User',
    email: userEmail || '',
  });
};

// Get active users for a repository
export const getActiveUsers = (repoId, timeWindowMs = 5 * 60 * 1000) => {
  if (!repoId || !activeUsersByRepo.has(repoId)) return [];
  
  const repoUsers = activeUsersByRepo.get(repoId);
  const now = Date.now();
  const activeUsers = [];
  
  // Filter users active within the time window
  repoUsers.forEach((userData, userId) => {
    if (now - userData.lastActive <= timeWindowMs) {
      activeUsers.push({
        userId,
        name: userData.name,
        email: userData.email
      });
    }
  });
  
  return activeUsers;
};

// Set up heartbeat system to track user presence
let heartbeatIntervalId = null;

export const startUserPresence = (repoId, userId, userName, userEmail) => {
  if (!repoId || !userId) return;
  
  // Record initial activity
  recordUserActivity(repoId, userId, userName, userEmail);
  
  // Clear any existing interval
  if (heartbeatIntervalId) {
    clearInterval(heartbeatIntervalId);
  }
  
  // Set up interval to update activity (every 30 seconds)
  heartbeatIntervalId = setInterval(() => {
    recordUserActivity(repoId, userId, userName, userEmail);
  }, 30000);
};

export const stopUserPresence = () => {
  if (heartbeatIntervalId) {
    clearInterval(heartbeatIntervalId);
    heartbeatIntervalId = null;
  }
};
