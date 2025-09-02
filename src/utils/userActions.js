import { databases, DATABASES_ID, BOOKMARKS_COLLECTION_ID, ISSUES_COLLECTION_ID, REPOS_COLLECTION_ID, CLAIMS_COLLECTION_ID, MESSAGES_COLLECTION_ID } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

/**
 * Bookmark an issue for a user
 * @param {string} userId - User ID
 * @param {string} issueId - Issue document ID
 */
export const bookmarkIssue = async (userId, issueId) => {
  try {
    const bookmark = await databases.createDocument(
      DATABASES_ID,
      BOOKMARKS_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        issueId,
        createdAt: new Date().toISOString(),
      }
    );
    return bookmark;
  } catch (error) {
    console.error('Failed to bookmark issue', error);
    throw error;
  }
};

/**
 * Check if an issue is bookmarked by a user
 * @param {string} userId - User ID
 * @param {string} issueId - Issue document ID
 */
export const isIssueBookmarked = async (userId, issueId) => {
  try {
    const bookmarks = await databases.listDocuments(
      DATABASES_ID,
      BOOKMARKS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('issueId', issueId)
      ]
    );
    return bookmarks.documents.length > 0;
  } catch (error) {
    console.error('Failed to check if issue is bookmarked', error);
    return false;
  }
};

/**
 * Remove a bookmark
 * @param {string} bookmarkId - Bookmark document ID
 * @param {string} userId - User ID (for validation)
 */
export const removeBookmark = async (bookmarkId, userId) => {
  try {
    // First verify the bookmark belongs to the user
    const bookmark = await databases.getDocument(
      DATABASES_ID,
      BOOKMARKS_COLLECTION_ID,
      bookmarkId
    );
    
    if (bookmark.userId !== userId) {
      throw new Error('Unauthorized: This bookmark does not belong to you');
    }
    
    await databases.deleteDocument(
      DATABASES_ID,
      BOOKMARKS_COLLECTION_ID,
      bookmarkId
    );
    return { success: true };
  } catch (error) {
    console.error('Failed to remove bookmark', error);
    throw error;
  }
};

/**
 * Remove a bookmark by user ID and issue ID
 * @param {string} userId - User ID
 * @param {string} issueId - Issue document ID
 */
export const removeBookmarkByIssue = async (userId, issueId) => {
  try {
    // Find the bookmark
    const bookmarks = await databases.listDocuments(
      DATABASES_ID,
      BOOKMARKS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('issueId', issueId)
      ]
    );
    
    if (bookmarks.documents.length === 0) {
      throw new Error('Bookmark not found');
    }
    
    const bookmark = bookmarks.documents[0];
    
    await databases.deleteDocument(
      DATABASES_ID,
      BOOKMARKS_COLLECTION_ID,
      bookmark.$id
    );
    
    return { success: true };
  } catch (error) {
    console.error('Failed to remove bookmark by issue', error);
    throw error;
  }
};

/**
 * Get all bookmarks for a user
 * @param {string} userId - User ID
 */
export const getUserBookmarks = async (userId) => {
  try {
    const bookmarks = await databases.listDocuments(
      DATABASES_ID,
      BOOKMARKS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    return bookmarks.documents;
  } catch (error) {
    console.error('Failed to get user bookmarks', error);
    throw error;
  }
};

/**
 * Get all bookmarks for a user with associated issue and repository data
 * @param {string} userId - User ID
 */
export const getUserBookmarksWithDetails = async (userId) => {
  try {
    // Get bookmarks for the user
    const bookmarks = await databases.listDocuments(
      DATABASES_ID,
      BOOKMARKS_COLLECTION_ID,
      [Query.equal('userId', userId), Query.orderDesc('createdAt')]
    );

    // Fetch issue and repository details for each bookmark
    const bookmarksWithDetails = await Promise.all(
      bookmarks.documents.map(async (bookmark) => {
        try {
          // Get issue details
          const issue = await databases.getDocument(
            DATABASES_ID,
            ISSUES_COLLECTION_ID,
            bookmark.issueId
          );

          // Get repository details
          const repository = await databases.getDocument(
            DATABASES_ID,
            REPOS_COLLECTION_ID,
            issue.repoId
          );

          return {
            id: bookmark.$id,
            bookmarkId: bookmark.$id,
            issueId: bookmark.issueId,
            userId: bookmark.userId,
            createdAt: bookmark.createdAt,
            // Issue details
            number: issue.number,
            title: issue.title,
            body: issue.body,
            state: issue.state,
            labels: issue.labels,
            html_url: issue.html_url,
            issueCreatedAt: issue.createdAt,
            issueUpdatedAt: issue.updatedAt,
            // Repository details
            repository: repository.full_name,
            repositoryOwner: repository.owner,
            repositoryName: repository.repo,
            // Format date for display
            date: new Date(bookmark.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            // Add formatted description
            description: issue.body ? issue.body.substring(0, 200) + (issue.body.length > 200 ? '...' : '') : 'No description provided.',
            // Add URL for external link
            url: issue.html_url
          };
        } catch (error) {
          console.error('Failed to fetch details for bookmark:', bookmark.$id, error);
          // Return bookmark with minimal info if details fetch fails
          return {
            id: bookmark.$id,
            bookmarkId: bookmark.$id,
            issueId: bookmark.issueId,
            userId: bookmark.userId,
            createdAt: bookmark.createdAt,
            title: 'Issue details unavailable',
            description: 'Could not load issue details',
            repository: 'Unknown repository',
            labels: [],
            date: new Date(bookmark.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          };
        }
      })
    );

    return bookmarksWithDetails;
  } catch (error) {
    console.error('Failed to get user bookmarks with details', error);
    throw error;
  }
};

/**
 * Claim an issue (indicate working on it)
 * @param {string} userId - User ID
 * @param {string} issueId - Issue document ID
 */
export const claimIssue = async (userId, issueId) => {
  try {
    const claim = await databases.createDocument(
      DATABASES_ID,
      CLAIMS_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        issueId,
        status: 'active',
        claimedAt: new Date().toISOString(),
      }
    );
    return claim;
  } catch (error) {
    console.error('Failed to claim issue', error);
    throw error;
  }
};

/**
 * Get all claims for an issue
 * @param {string} issueId - Issue document ID
 */
export const getIssueClaims = async (issueId) => {
  try {
    const claims = await databases.listDocuments(
      DATABASES_ID,
      CLAIMS_COLLECTION_ID,
      [Query.equal('issueId', issueId)]
    );
    return claims.documents;
  } catch (error) {
    console.error('Failed to get issue claims', error);
    throw error;
  }
};

/**
 * Post a message to a repository discussion using Appwrite Database
 * @param {string} userId - User ID
 * @param {string} repoId - Repository document ID
 * @param {string} message - Message text
 */
export const postMessage = async (userId, repoId, message) => {
  try {
    // Get user details from the account service to include name
    // This will make messages more user-friendly by displaying real names
    let userName = 'Unknown User';
    let userEmail = '';
    
    try {
      // Try to fetch user data from local storage if available
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        userName = parsedData.name || 'Unknown User';
        userEmail = parsedData.email || '';
      }
    } catch (e) {
      console.warn('Could not fetch user details from local storage:', e);
    }
    
    // Create message document data
    const messageData = {
      userId,
      repoId,
      text: message,
      createdAt: new Date().toISOString(),
    };
    
    // Only add userName and userEmail if they're not empty
    if (userName !== 'Unknown User') {
      messageData.userName = userName;
    }
    
    if (userEmail) {
      messageData.userEmail = userEmail;
    }
    
    // Create a document in the database for the message
    const dbMessage = await databases.createDocument(
      DATABASES_ID,
      MESSAGES_COLLECTION_ID,
      ID.unique(),
      messageData
    );
    
    return dbMessage;
  } catch (error) {
    console.error('Failed to post message', error);
    throw error;
  }
};

/**
 * Get messages for a repository from database
 * @param {string} repoId - Repository document ID
 */
export const getRepositoryMessages = async (repoId) => {
  try {
    // Get messages from the database
    const messages = await databases.listDocuments(
      DATABASES_ID,
      MESSAGES_COLLECTION_ID,
      [
        Query.equal('repoId', repoId),
        Query.orderAsc('createdAt')
      ]
    );
    
    return messages.documents;
  } catch (error) {
    console.error('Failed to get repository messages', error);
    throw error;
  }
};
