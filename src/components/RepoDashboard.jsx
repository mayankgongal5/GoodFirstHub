import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, RefreshCw, Trash2, CheckCircle } from 'lucide-react';
import { getUserRepositories, getAllRepositories } from '../utils/githubUtils';
import { useAuth } from '../context/AuthContext';

function RepoDashboard({ repoId, onSelectRepo, onDeleted, onRefreshed }) {
  const { user } = useAuth();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(repoId);
  const [syncingId, setSyncingId] = useState(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoading(true);
        let reposData = [];
        
        // First try to get user's repos if we have a user
        if (user) {
          reposData = await getUserRepositories(user.$id);
        }
        
        // If no user repos, get all available repos
        if (reposData.length === 0) {
          reposData = await getAllRepositories();
        }
        
        setRepos(reposData);
        
        // If no repo is selected and we have repos, select the first one
        if (!selectedRepo && reposData.length > 0) {
          setSelectedRepo(reposData[0].$id);
          if (onSelectRepo) {
            onSelectRepo(reposData[0].$id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch repositories:', error);
        setError('Failed to load repositories');
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [user]);

  useEffect(() => {
    setSelectedRepo(repoId);
  }, [repoId]);

  const handleRepoClick = (repo) => {
    setSelectedRepo(repo.$id);
    if (onSelectRepo) {
      onSelectRepo(repo.$id);
    }
  };

  const handleSync = async (repo) => {
    try {
      setSyncingId(repo.$id);
      console.log('Syncing repo:', repo.$id, repo.full_name);
      const { fetchRepositoryIssues } = await import('../utils/githubUtils');
      const result = await fetchRepositoryIssues(repo.$id, { wait: true, timeoutMs: 30000 });
      console.log('Sync result for', repo.full_name, ':', result);
      // Update last synced locally
      setRepos((prev) => prev.map((r) => r.$id === repo.$id ? { ...r, lastSyncedAt: new Date().toISOString() } : r));
      onRefreshed && onRefreshed(repo.$id);
    } catch (e) {
      console.error('Sync failed for', repo.full_name, ':', e);
      alert(`Failed to sync ${repo.full_name}: ${e?.message || 'Unknown error'}`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (repo) => {
    const confirmMsg = `Delete repository "${repo.full_name}"? This will also delete its issues.`;
    if (!window.confirm(confirmMsg)) return;
    try {
      setLoading(true);
      const { deleteRepository } = await import('../utils/githubUtils');
      await deleteRepository(repo.$id, { deleteIssues: true });
      // Refresh local list
      const updated = repos.filter((r) => r.$id !== repo.$id);
      setRepos(updated);
      // Reselect if we deleted the selected one
      if (selectedRepo === repo.$id) {
        const next = updated[0]?.$id || null;
        setSelectedRepo(next);
        onSelectRepo && onSelectRepo(next);
      }
      onDeleted && onDeleted(repo.$id);
    } catch (e) {
      console.error('Delete failed:', e);
      alert(e?.message || 'Failed to delete repository');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-md border border-[#EDEDF0] flex justify-center">
        <div className="animate-spin h-5 w-5 border-2 border-[#FD366E] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500/10 backdrop-blur-xl rounded-2xl border border-red-500/20 p-6"
      >
        <p className="text-sm text-red-400">{error}</p>
        <button 
          className="mt-3 text-xs text-[#2de0c0] hover:text-[#00d4aa] font-semibold transition-colors"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </motion.div>
    );
  }

  if (repos.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center"
      >
        <Github size={32} className="text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-400">
          No repositories found. Add a repository using the form above.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#2de0c0] to-[#00d4aa] rounded-xl flex items-center justify-center">
            <Github size={16} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Your Repositories</h2>
        </div>
      </div>
      
      <ul className="divide-y divide-white/5">
        {repos.map((repo, index) => (
          <motion.li
            key={repo.$id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            onClick={() => handleRepoClick(repo)}
            className={`p-6 cursor-pointer transition-all duration-300 ${
              repo.$id === selectedRepo 
                ? 'bg-[#f02e65]/10 border-l-4 border-[#f02e65]' 
                : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-lg truncate">{repo.full_name}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Last updated: {new Date(repo.lastSyncedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {repo.$id === selectedRepo && (
                  <div className="bg-[#2de0c0]/20 text-[#2de0c0] px-2 py-1 text-xs rounded-full border border-[#2de0c0]/30 flex items-center gap-1 whitespace-nowrap">
                    <CheckCircle size={10} />
                    Active
                  </div>
                )}
                {repo.$id === selectedRepo && (
                  <button
                    type="button"
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
                      syncingId === repo.$id 
                        ? 'text-gray-400 cursor-not-allowed bg-gray-600/20' 
                        : 'text-[#2de0c0] hover:bg-[#2de0c0]/10 border border-[#2de0c0]/30'
                    }`}
                    onClick={(e) => { e.stopPropagation(); if (syncingId !== repo.$id) handleSync(repo); }}
                    disabled={syncingId === repo.$id}
                    aria-label={`Sync issues for ${repo.full_name}`}
                  >
                    <RefreshCw size={10} className={syncingId === repo.$id ? 'animate-spin' : ''} />
                    {syncingId === repo.$id ? 'Syncing…' : 'Sync'}
                  </button>
                )}
                <button
                  type="button"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-all duration-300 whitespace-nowrap"
                  onClick={(e) => { e.stopPropagation(); handleDelete(repo); }}
                  aria-label={`Delete ${repo.full_name}`}
                >
                  <Trash2 size={10} />
                  Delete
                </button>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export default RepoDashboard;
