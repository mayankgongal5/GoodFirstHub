import { Client, Account, Databases, Storage, Functions, Avatars } from "appwrite";

console.log('Appwrite Config:', {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || 'beginnercontribute'
});

// Create a client with session handling
const createClient = () => {
  const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

  // Try to get the session from localStorage
  const session = localStorage.getItem('cookieFallback');
  if (session) {
    try {
      const sessionData = JSON.parse(session);
      if (sessionData.account) {
        client.headers['X-Fallback-Cookies'] = sessionData.account;
      }
    } catch (e) {
      console.warn('Failed to parse session data', e);
    }
  }
  
  return client;
};

const client = createClient();
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);
const avatars = new Avatars(client);

// Database and Collection IDs from environment variables
export const DATABASES_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'beginnercontribute';
export const REPOS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_REPOS_COLLECTION_ID || 'repos';
export const ISSUES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ISSUES_COLLECTION_ID || 'issues';
export const BOOKMARKS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_BOOKMARKS_COLLECTION_ID || 'bookmarks';
export const CLAIMS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CLAIMS_COLLECTION_ID || 'claims';
export const MESSAGES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID || 'messages';

// No messaging configuration needed

// Function to update client with new session
export const updateClientSession = () => {
  const newClient = createClient();
  return newClient;
};

export { client, account, databases, storage, functions, avatars };
