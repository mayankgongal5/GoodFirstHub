// const { Client, Databases, ID, Query, Permission, Role } = require('node-appwrite');
// const axios = require('axios');

// module.exports = async function (context) {
//   const { req, res, log, error: logError } = context;
//   const startTime = Date.now();
//   const TIMEOUT_BUFFER = 5000; // Leave 5 seconds buffer before timeout
//   const MAX_EXECUTION_TIME = 25000; // 25 seconds max execution
  
//   try {
//     log('Function started at: ' + new Date().toISOString());

//     // Initialize Appwrite client
//     const client = new Client()
//       .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
//       .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
//       .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

//     const databases = new Databases(client);

//     // Parse request body
//     let data = {};
//     try {
//       data = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
//     } catch (parseError) {
//       return res.json({ 
//         success: false, 
//         message: 'Invalid JSON in request body',
//         error: parseError.message 
//       });
//     }

//     const repoId = data.repoId;
//     const issueLimit = parseInt(data.issueLimit || '10', 10); // Only fetch 10 recent issues by default
//     const maxPages = 1; // Limit to first page only for speed

//     if (!repoId) {
//       return res.json({ success: false, message: 'Repository ID is required' });
//     }

//     // Database configuration
//     const DATABASES_ID = process.env.DATABASES_ID || 'beginnercontribute';
//     const REPOS_COLLECTION_ID = process.env.REPOS_COLLECTION_ID || 'repos';
//     const ISSUES_COLLECTION_ID = process.env.ISSUES_COLLECTION_ID || 'issues';

//     // Fetch repository
//     let repo;
//     try {
//       repo = await databases.getDocument(DATABASES_ID, REPOS_COLLECTION_ID, repoId);
//     } catch (repoError) {
//       return res.json({ 
//         success: false, 
//         message: 'Repository not found',
//         error: repoError.message 
//       });
//     }

//     const { owner, repo: repoName } = repo;

//     // Check execution time helper
//     const isTimeoutApproaching = () => {
//       return (Date.now() - startTime) > (MAX_EXECUTION_TIME - TIMEOUT_BUFFER);
//     };

//     // GitHub API setup
//     const headers = {
//       Accept: 'application/vnd.github.v3+json',
//       'User-Agent': 'BeginnerContributeApp',
//     };
//     if (process.env.GITHUB_TOKEN) {
//       headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
//     }

//     const LABELS_FILTER = (process.env.LABELS_FILTER || '')
//       .split(',')
//       .map((s) => s.trim())
//       .filter(Boolean);

//     let allIssues = [];
//     // Fetch only recent issues to avoid timeout
//     let page = 1;
//     let hasMorePages = true;

//     while (hasMorePages && !isTimeoutApproaching() && page <= maxPages) {
//       log(`Fetching page ${page}...`);
      
//       try {
//         const ghResponse = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/issues`, {
//           params: { 
//             state: 'open', 
//             per_page: 50, // Fixed batch size
//             page, 
//             sort: 'updated', // Get most recently updated issues
//             direction: 'desc' // Most recent first
//           },
//           headers,
//           timeout: 10000 // 10 second timeout per request
//         });

//         const items = Array.isArray(ghResponse.data) ? ghResponse.data : [];
//         let batch = items.filter((i) => !i.pull_request);
        
//         // Apply label filtering
//         if (LABELS_FILTER.length) {
//           batch = batch.filter((i) => {
//             const names = (i.labels || []).map((l) => l.name);
//             return names.some((n) => LABELS_FILTER.includes(n));
//           });
//         }
        
//         if (batch.length === 0) {
//           hasMorePages = false;
//           break;
//         }
        
//         allIssues = allIssues.concat(batch);
        
//         // Stop if we have enough issues
//         if (allIssues.length >= issueLimit) {
//           console.log(`Reached issue limit of ${issueLimit}, stopping fetch`);
//           allIssues = allIssues.slice(0, issueLimit); // Trim to exact limit
//           hasMorePages = false;
//           break;
//         }
        
//         // Check if this was the last page
//         if (items.length < 50) {
//           hasMorePages = false;
//         }
        
//         page += 1;
        
//         // Don't exceed max pages
//         if (page > maxPages) {
//           console.log('Reached maximum pages, stopping');
//           hasMorePages = false;
//         }
        
//       } catch (githubError) {
//         console.error('GitHub API error:', githubError.message);
//         break; // Don't fail entirely, process what we have
//       }
//     }

//     console.log(`Processing ${allIssues.length} issues...`);

//     // Process issues in batches with timeout protection
//     let processed = 0;
//     let errors = 0;
//     const BATCH_SIZE = 10; // Process in smaller batches

//     for (let i = 0; i < allIssues.length; i += BATCH_SIZE) {
//       if (isTimeoutApproaching()) {
//         console.log('Timeout approaching, stopping processing');
//         break;
//       }

//       const batch = allIssues.slice(i, i + BATCH_SIZE);
//       const batchPromises = batch.map(async (issue) => {
//         const labels = (issue.labels || []).map((l) => l.name);
//         const issueData = {
//           repoId,
//           github_issue_id: issue.id,
//           number: issue.number,
//           title: issue.title,
//           body: issue.body || '',
//           state: issue.state,
//           createdAt: issue.created_at,
//           updatedAt: issue.updated_at,
//           labels,
//           html_url: issue.html_url,
//         };

//         const docId = String(issue.id);
//         const perms = [];
//         if (Permission && Role) {
//           perms.push(Permission.read(Role.any()));
//         }

//         try {
//           await databases.createDocument(
//             DATABASES_ID,
//             ISSUES_COLLECTION_ID,
//             docId,
//             issueData,
//             perms.length ? perms : undefined
//           );
//           return { success: true, issue: issue.number };
//         } catch (createErr) {
//           const msg = createErr?.message || '';
//           if (msg.includes('already exists') || createErr?.code === 409) {
//             try {
//               await databases.updateDocument(
//                 DATABASES_ID,
//                 ISSUES_COLLECTION_ID,
//                 docId,
//                 issueData
//               );
//               return { success: true, issue: issue.number, updated: true };
//             } catch (updateErr) {
//               return { success: false, issue: issue.number, error: updateErr.message };
//             }
//           } else {
//             return { success: false, issue: issue.number, error: createErr.message };
//           }
//         }
//       });

//       try {
//         const results = await Promise.all(batchPromises);
//         results.forEach(result => {
//           if (result.success) {
//             processed += 1;
//           } else {
//             errors += 1;
//             console.error(`Error processing issue #${result.issue}:`, result.error);
//           }
//         });
//       } catch (batchError) {
//         console.error('Batch processing error:', batchError.message);
//         errors += batch.length;
//       }

//       console.log(`Processed batch ${Math.floor(i/BATCH_SIZE) + 1}, total processed: ${processed}`);
//     }

//     // Update repo sync timestamp (with timeout check)
//     if (!isTimeoutApproaching()) {
//       try {
//         await databases.updateDocument(DATABASES_ID, REPOS_COLLECTION_ID, repoId, {
//           lastSyncedAt: new Date().toISOString(),
//           lastProcessedCount: processed, // Track how many we processed
//         });
//       } catch (timestampError) {
//         console.error('Error updating sync timestamp:', timestampError.message);
//       }
//     }

//     const executionTime = Date.now() - startTime;
//     const result = {
//       success: true,
//       repository: `${owner}/${repoName}`,
//       issuesCount: processed,
//       errorsCount: errors,
//       totalFetched: allIssues.length,
//       executionTime: `${executionTime}ms`,
//       nextPage: hasMorePages ? page : null,
//       message: `Synced ${processed} issues for ${owner}/${repoName}`,
//     };

//     console.log('Function completed:', result);
//     return res.json(result);

//   } catch (error) {
//     const executionTime = Date.now() - startTime;
//     console.error('Fatal error:', error.message);
//     console.error('Stack:', error.stack);
    
//     return res.json({
//       success: false,
//       message: error?.message || 'Unexpected error occurred',
//       error: error?.message || 'Unknown error'
//     });
//   }
// };


const { Client, Databases, ID, Query, Permission, Role } = require('node-appwrite');
const axios = require('axios');

module.exports = async function (context) {
  const { req, res, log, error: logError } = context;
  const startTime = Date.now();
  const TIMEOUT_BUFFER = 5000; // Leave 5 seconds buffer before timeout
  const MAX_EXECUTION_TIME = 25000; // 25 seconds max execution
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.json({}, 200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    });
  }
  
  try {
    log('Function started at: ' + new Date().toISOString());

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

    const databases = new Databases(client);

    // Parse request body
    let data = {};
    try {
      data = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    } catch (parseError) {
      return res.json({ 
        success: false, 
        message: 'Invalid JSON in request body',
        error: parseError.message 
      }, 400, {
        'Access-Control-Allow-Origin': '*'
      });
    }

    const repoId = data.repoId;
    const issueLimit = parseInt(data.issueLimit || '10', 10); // Only fetch 10 recent issues by default
    const maxPages = 1; // Limit to first page only for speed

    if (!repoId) {
      return res.json({ 
        success: false, 
        message: 'Repository ID is required' 
      }, 400, {
        'Access-Control-Allow-Origin': '*'
      });
    }

    // Database configuration
    const DATABASES_ID = process.env.DATABASES_ID || 'beginnercontribute';
    const REPOS_COLLECTION_ID = process.env.REPOS_COLLECTION_ID || 'repos';
    const ISSUES_COLLECTION_ID = process.env.ISSUES_COLLECTION_ID || 'issues';

    // Fetch repository
    let repo;
    try {
      repo = await databases.getDocument(DATABASES_ID, REPOS_COLLECTION_ID, repoId);
    } catch (repoError) {
      return res.json({ 
        success: false, 
        message: 'Repository not found',
        error: repoError.message 
      }, 404, {
        'Access-Control-Allow-Origin': '*'
      });
    }

    const { owner, repo: repoName } = repo;

    // Check execution time helper
    const isTimeoutApproaching = () => {
      return (Date.now() - startTime) > (MAX_EXECUTION_TIME - TIMEOUT_BUFFER);
    };

    // GitHub API setup
    const headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'BeginnerContributeApp',
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const LABELS_FILTER = (process.env.LABELS_FILTER || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    let allIssues = [];
    // Fetch only recent issues to avoid timeout
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages && !isTimeoutApproaching() && page <= maxPages) {
      log(`Fetching page ${page}...`);
      
      try {
        const ghResponse = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/issues`, {
          params: { 
            state: 'open', 
            per_page: 50, // Fixed batch size
            page, 
            sort: 'updated', // Get most recently updated issues
            direction: 'desc' // Most recent first
          },
          headers,
          timeout: 10000 // 10 second timeout per request
        });

        const items = Array.isArray(ghResponse.data) ? ghResponse.data : [];
        let batch = items.filter((i) => !i.pull_request);
        
        // Apply label filtering
        if (LABELS_FILTER.length) {
          batch = batch.filter((i) => {
            const names = (i.labels || []).map((l) => l.name);
            return names.some((n) => LABELS_FILTER.includes(n));
          });
        }
        
          if (batch.length === 0) {
            log('No issues found after filtering, breaking loop');
            hasMorePages = false;
            break;
          }
          
          allIssues = allIssues.concat(batch);
          
          // Stop if we have enough issues
          if (allIssues.length >= issueLimit) {
            log(`Reached issue limit of ${issueLimit}, stopping fetch`);
            allIssues = allIssues.slice(0, issueLimit); // Trim to exact limit
            hasMorePages = false;
            break;
          }
        
        // Check if this was the last page
        if (items.length < 50) {
          hasMorePages = false;
        }
        
          // Don't exceed max pages
          if (page > maxPages) {
            log('Reached maximum pages, stopping');
            hasMorePages = false;
          }
        
      } catch (githubError) {
        console.error('GitHub API error:', githubError.message);
        break; // Don't fail entirely, process what we have
      }
    }

    log(`Processing ${allIssues.length} issues...`);

    // Process issues in batches with timeout protection
    let processed = 0;
    let errors = 0;
    const BATCH_SIZE = 10; // Process in smaller batches

    for (let i = 0; i < allIssues.length; i += BATCH_SIZE) {
      if (isTimeoutApproaching()) {
        log('Timeout approaching, stopping processing');
        break;
      }

      const batch = allIssues.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (issue) => {
        const labels = (issue.labels || []).map((l) => l.name);
        const issueData = {
          repoId,
          github_issue_id: issue.id,
          number: issue.number,
          title: issue.title,
          body: issue.body || '',
          state: issue.state,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          labels,
          html_url: issue.html_url,
        };

        const docId = String(issue.id);
        const perms = [];
        if (Permission && Role) {
          perms.push(Permission.read(Role.any()));
        }

        try {
          await databases.createDocument(
            DATABASES_ID,
            ISSUES_COLLECTION_ID,
            docId,
            issueData,
            perms.length ? perms : undefined
          );
          return { success: true, issue: issue.number };
        } catch (createErr) {
          const msg = createErr?.message || '';
          if (msg.includes('already exists') || createErr?.code === 409) {
            try {
              await databases.updateDocument(
                DATABASES_ID,
                ISSUES_COLLECTION_ID,
                docId,
                issueData
              );
              return { success: true, issue: issue.number, updated: true };
            } catch (updateErr) {
              return { success: false, issue: issue.number, error: updateErr.message };
            }
          } else {
            return { success: false, issue: issue.number, error: createErr.message };
          }
        }
      });

      try {
        const results = await Promise.all(batchPromises);
        results.forEach(result => {
          if (result.success) {
            processed += 1;
          } else {
            errors += 1;
            log(`Error processing issue #${result.issue}: ${result.error}`);
          }
        });
      } catch (batchError) {
        log('Batch processing error: ' + batchError.message);
        errors += batch.length;
      }

      log(`Processed batch ${Math.floor(i/BATCH_SIZE) + 1}, total processed: ${processed}`);
    }

    // Update repo sync timestamp (with timeout check)
    if (!isTimeoutApproaching()) {
      try {
        await databases.updateDocument(DATABASES_ID, REPOS_COLLECTION_ID, repoId, {
          lastSyncedAt: new Date().toISOString(),
          lastProcessedCount: processed, // Track how many we processed
        });
      } catch (timestampError) {
        log('Error updating sync timestamp: ' + timestampError.message);
      }
    }

    const executionTime = Date.now() - startTime;
    const result = {
      success: true,
      repository: `${owner}/${repoName}`,
      issuesCount: processed,
      errorsCount: errors,
      totalFetched: allIssues.length,
      executionTime: `${executionTime}ms`,
      nextPage: hasMorePages ? page : null,
      message: `Synced ${processed} issues for ${owner}/${repoName}`,
    };

    log('Function completed: ' + JSON.stringify(result));
    return res.json(result, 200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    logError('Fatal error: ' + error.message);
    logError('Stack: ' + error.stack);
    
    return res.json({
      success: false,
      message: error?.message || 'Unexpected error occurred',
      error: error?.message || 'Unknown error'
    }, 500, {
      'Access-Control-Allow-Origin': '*'
    });
  }
};