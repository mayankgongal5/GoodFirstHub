import { ID as AppwriteID, Query, Permission, Role } from 'appwrite';
import { databases, functions, DATABASES_ID, REPOS_COLLECTION_ID, ISSUES_COLLECTION_ID } from '../lib/appwrite';

/**
 * Add a GitHub repository to track
 * @param {string} ownerRepo - Format: "owner/repo" or full GitHub URL
 * @param {string} userId - ID of the user adding the repo
 */
export const addRepository = async (ownerRepo, userId) => {
  let owner, repo;

  // Extract owner/repo from input or URL
  if (ownerRepo.includes('github.com')) {
    const url = new URL(ownerRepo);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      [owner, repo] = parts;
    } else {
      throw new Error('Invalid GitHub URL');
    }
  } else {
    const parts = ownerRepo.split('/');
    if (parts.length !== 2) throw new Error('Invalid repository format. Use owner/repo format');
    [owner, repo] = parts;
  }

  if (!owner || !repo) throw new Error('Could not extract owner and repository name');

  try {
    // Create repo doc with sane permissions (creator RW, public read)
    const repoDoc = await databases.createDocument(
      DATABASES_ID,
      REPOS_COLLECTION_ID,
      AppwriteID.unique(),
      {
        owner,
        repo,
        full_name: `${owner}/${repo}`,
        addedBy: userId,
        hasWebhook: false,
        github_repo_id: Math.floor(Math.random() * 1000000),
        lastSyncedAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
        Permission.read(Role.any()),
      ]
    );

    // Trigger issues sync and wait briefly so UI can show results
    try {
      console.log('Calling fetchRepositoryIssues for newly created repo:', repoDoc.$id);
      const result = await fetchRepositoryIssues(repoDoc.$id, { wait: true, timeoutMs: 30000, intervalMs: 1200 });
      console.log('Initial fetch result:', result);
    } catch (err) {
      console.warn('Failed to fetch repository issues:', err?.message || err);
      // Don't throw here - repo was created successfully, just the initial fetch failed
    }

    return repoDoc;
  } catch (error) {
    console.error('Error creating repository:', error);
    if (error?.code === 401 || error?.code === 403) {
      throw new Error('Not authorized. Please sign in and ensure your Appwrite API permissions allow creating repo documents.');
    }
    throw new Error('Failed to add repository: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Execute the fetchRepoIssues function and optionally poll until done
 * @param {string} repoId
 * @param {{wait?: boolean, timeoutMs?: number, intervalMs?: number}} options
 */
export const fetchRepositoryIssues = async (repoId, options = {}) => {
  const { wait = false, timeoutMs = 20000, intervalMs = 1000 } = options;
  
  // Validate repoId
  if (!repoId || typeof repoId !== 'string') {
    const error = `Invalid repoId: ${repoId} (type: ${typeof repoId})`;
    console.error(error);
    throw new Error(error);
  }
  
  try {
    console.log('fetchRepositoryIssues called with:', { 
      repoId, 
      repoIdType: typeof repoId,
      repoIdLength: repoId.length
    });

    // Use HTTP endpoint (same as your curl command)
    const endpoint = 'https://68b68b5b00138afc3694.fra.appwrite.run/';
    const requestBody = { repoId };
    
    console.log('Making HTTP POST to:', endpoint);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    
    console.log('HTTP response status:', resp.status, resp.statusText);
    
    const responseText = await resp.text();
    console.log('Raw response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
    }
    
    console.log('Parsed response data:', data);
    
    if (!resp.ok || data?.success === false) {
      const msg = data?.message || `Function HTTP call failed (${resp.status})`;
      console.error('Function call failed:', { status: resp.status, message: msg, data });
      throw new Error(msg);
    }
    
    return data;

  } catch (error) {
    console.error('Failed to execute repository issues function:', error);
    throw error;
  }
};

/**
 * Get repositories added by the user
 */
export const getUserRepositories = async (userId) => {
  try {
    if (!userId) return [];
    const response = await databases.listDocuments(
      DATABASES_ID,
      REPOS_COLLECTION_ID,
      [Query.equal('addedBy', userId)]
    );
    return response.documents;
  } catch (error) {
    console.error('Failed to get user repositories', error);
    return [];
  }
};

/**
 * Get all repositories (newest first)
 */
export const getAllRepositories = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASES_ID,
      REPOS_COLLECTION_ID,
      [Query.orderDesc('$createdAt')]
    );
    return response.documents;
  } catch (error) {
    console.error('Failed to get all repositories', error);
    return [];
  }
};

/**
 * Get issues for a repository, optionally filtered by labels
 */
export const getRepositoryIssues = async (repoId, labels = []) => {
  try {
    const queries = [Query.equal('repoId', repoId), Query.orderDesc('createdAt')];
    if (Array.isArray(labels) && labels.length > 0) {
      // labels is an array attribute; use contains to match any of the provided labels
      queries.push(Query.contains('labels', labels));
    }
    const response = await databases.listDocuments(
      DATABASES_ID,
      ISSUES_COLLECTION_ID,
      queries
    );
    return response.documents;
  } catch (error) {
    console.error('Failed to get repository issues', error);
    throw error;
  }
};

/**
 * Aggregate labels for a repo with counts
 */
export const getRepositoryLabels = async (repoId) => {
  const issues = await getRepositoryIssues(repoId);
  const allLabels = issues.flatMap((i) => i.labels || []);
  const counts = new Map();
  for (const l of allLabels) counts.set(l, (counts.get(l) || 0) + 1);
  return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
};

/**
 * Delete a repository and optionally all its issues
 * Requires delete permission on the repo document (and issues if cascading)
 * @param {string} repoId
 * @param {{ deleteIssues?: boolean }} options
 */
export const deleteRepository = async (repoId, options = {}) => {
  const { deleteIssues = true } = options;
  if (!repoId) throw new Error('Repository ID is required');

  let deletedIssues = 0;
  try {
    if (deleteIssues) {
      const LIMIT = 100;
      let hasMore = true;
      let cursor = null;
      while (hasMore) {
        const queries = [
          Query.equal('repoId', repoId),
          Query.orderAsc('$id'),
          Query.limit(LIMIT),
        ];
        if (cursor) queries.push(Query.cursorAfter(cursor));

        const res = await databases.listDocuments(
          DATABASES_ID,
          ISSUES_COLLECTION_ID,
          queries
        );
        const docs = res.documents || [];
        if (docs.length === 0) break;

        // Delete in parallel but don’t explode on a single failure
        const results = await Promise.allSettled(
          docs.map((d) => databases.deleteDocument(DATABASES_ID, ISSUES_COLLECTION_ID, d.$id))
        );
        deletedIssues += results.filter((r) => r.status === 'fulfilled').length;

        const last = docs[docs.length - 1];
        cursor = last?.$id || null;
        hasMore = docs.length === LIMIT;
      }
    }

    await databases.deleteDocument(DATABASES_ID, REPOS_COLLECTION_ID, repoId);

    return { success: true, deletedIssues };
  } catch (error) {
    console.error('Failed to delete repository', error);
    throw new Error(error?.message || 'Failed to delete repository');
  }
};
