import { useState, useEffect } from 'react';
import IssueCard from './IssueCard';
import { getRepositoryIssues } from '../utils/githubUtils';

function IssuesList({ repoId, selectedTags = [], refreshKey = 0 }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const issuesData = await getRepositoryIssues(repoId, selectedTags);
        setIssues(issuesData);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
        setError('Failed to load issues');
      } finally {
        setLoading(false);
      }
    };

    if (repoId) {
      fetchIssues();
    }
  }, [repoId, selectedTags, refreshKey]);

  const handleIssueAction = (action, issue) => {
    // You can implement additional logic here if needed
    console.log(`Issue ${action}:`, issue);
  };

  const sortedIssues = [...issues].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
  });

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-[#f02e65] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/20 text-red-400 rounded-2xl border border-red-500/30">
        {error}
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="p-8 text-center bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10">
        <h3 className="text-lg font-medium text-white">No issues found</h3>
        {selectedTags.length > 0 ? (
          <p className="mt-2 text-gray-400">
            Try removing some filters or check back later.
          </p>
        ) : (
          <p className="mt-2 text-gray-400">
            This repository doesn't have any open issues, or they haven't been fetched yet.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-black/20 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-light text-white">
            Issues {selectedTags.length > 0 && `(Filtered by ${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''})`}
          </h2>
          <select
            className="bg-gray-800 text-white text-sm p-2 rounded"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="oldest">Oldest First</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Showing {issues.length} issue{issues.length !== 1 ? 's' : ''} sorted by {sortOrder === 'oldest' ? 'oldest' : 'newest'} first.
        </p>
      </div>

      <div className="space-y-4">
        {sortedIssues.map((issue) => (
          <IssueCard 
            key={issue.$id} 
            issue={issue} 
            onAction={handleIssueAction} 
          />
        ))}
      </div>
    </div>
  );
}

export default IssuesList;
