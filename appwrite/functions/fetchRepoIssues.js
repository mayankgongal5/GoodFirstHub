const { Client, Databases, ID, Query } = require('node-appwrite');
const axios = require('axios');

// This is your Appwrite function for fetching GitHub repository issues
// It should be deployed on Appwrite Cloud or self-hosted Appwrite instance

module.exports = async function(req, res) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

  const databases = new Databases(client);
  
  // Parse request data
  let data = {};
  try {
    data = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch (_) {
    data = {};
  }
  const repoId = data.repoId;
  
  if (!repoId) {
    return res.json({
      success: false,
      message: 'Repository ID is required'
    }, 400);
  }

  try {
    // Get repository details from Appwrite database
    const repo = await databases.getDocument(
      process.env.DATABASES_ID || 'beginnercontribute',
      process.env.REPOS_COLLECTION_ID || 'repos',
      repoId
    );

    const { owner, repo: repoName } = repo;
    
    // Fetch issues from GitHub API
    let page = 1;
    const perPage = 100;
    let allIssues = [];
    
    while (true) {
      const githubResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repoName}/issues`,
        {
          params: {
            state: 'open',
            per_page: perPage,
            page
          },
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {}),
            'User-Agent': 'BeginnerContributeApp'
          }
        }
      );
      
      const issues = githubResponse.data;
      
      if (!Array.isArray(issues) || issues.length === 0) {
        break;
      }
      
      // Filter out pull requests (they also appear in the issues endpoint)
      const filteredIssues = issues.filter(issue => !issue.pull_request);
      
      allIssues = [...allIssues, ...filteredIssues];
      
      if (issues.length < perPage) {
        break;
      }
      
      page++;
    }
    
    // Process and store issues in Appwrite
    const processedIssues = [];
    
    for (const issue of allIssues) {
      // Check if issue already exists
      let existingIssue;
      try {
        const results = await databases.listDocuments(
          process.env.DATABASES_ID || 'beginnercontribute',
          process.env.ISSUES_COLLECTION_ID || 'issues',
          [
            Query.equal('repoId', repoId),
            Query.equal('github_issue_id', issue.id)
          ]
        );
        
        existingIssue = results.documents.length > 0 ? results.documents[0] : null;
      } catch (error) {
        console.error('Error checking for existing issue:', error);
        existingIssue = null;
      }
      
      // Prepare issue data
      const issueData = {
        repoId,
        github_issue_id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body || '',
        state: issue.state,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        labels: issue.labels.map(label => label.name),
        html_url: issue.html_url
      };
      
      // Update or create the issue document
      try {
        if (existingIssue) {
          await databases.updateDocument(
            process.env.DATABASES_ID || 'beginnercontribute',
            process.env.ISSUES_COLLECTION_ID || 'issues',
            existingIssue.$id,
            issueData
          );
          processedIssues.push({ ...issueData, $id: existingIssue.$id, action: 'updated' });
        } else {
          const newIssue = await databases.createDocument(
            process.env.DATABASES_ID || 'beginnercontribute',
            process.env.ISSUES_COLLECTION_ID || 'issues',
            ID.unique(),
            issueData
          );
          processedIssues.push({ ...newIssue, action: 'created' });
        }
      } catch (error) {
        console.error('Error saving issue:', error);
      }
    }
    
    // Update repository last sync time
    await databases.updateDocument(
      process.env.DATABASES_ID || 'beginnercontribute',
      process.env.REPOS_COLLECTION_ID || 'repos',
      repoId,
      {
        lastSyncedAt: new Date().toISOString()
      }
    );
    
    return res.json({
      success: true,
      repository: `${owner}/${repoName}`,
      issuesCount: processedIssues.length,
      issues: processedIssues
    });
    
  } catch (error) {
    console.error('Error in fetchRepoIssues function:', error);
    
    return res.json({
      success: false,
      message: error.message || 'Failed to fetch repository issues',
      error: error.toString()
    }, 500);
  }
};
