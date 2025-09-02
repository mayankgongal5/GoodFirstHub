import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, Plus, RefreshCw, MessageCircle, Filter } from 'lucide-react';
import AddRepo from '../components/AddRepo';
import RepoDashboard from '../components/RepoDashboard';
import { deleteRepository } from '../utils/githubUtils';
import TagsFilter from '../components/TagsFilter';
import IssuesList from '../components/IssuesList';
import RepoChat from '../components/RepoChat';
import { getUserRepositories, getAllRepositories, fetchRepositoryIssues } from '../utils/githubUtils';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { user } = useAuth();
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoading(true);
        // Try user repos first if logged in
        const repos = user ? await getUserRepositories(user.$id) : [];
        
        // If there are no user repositories, fetch all repositories as fallback
        if (repos.length === 0) {
          const allRepos = await getAllRepositories();
          if (allRepos.length > 0) {
            setSelectedRepo(allRepos[0].$id);
            setRepoData(allRepos[0]);
          }
        } else {
          // If there are repositories, select the first one by default
          setSelectedRepo(repos[0].$id);
          setRepoData(repos[0]);
        }
      } catch (error) {
        console.error('Error fetching repositories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRepos();
  }, [user]);

  // When selected repo changes, fetch repo data
  useEffect(() => {
    const fetchRepoData = async () => {
  if (!selectedRepo) return;
      
      try {
        // Reset selected tags when repo changes
        setSelectedTags([]);
        
        // Get detailed repository data
  const repos = user ? await getUserRepositories(user.$id) : [];
  let repo = repos.find(r => r.$id === selectedRepo);
        
        // If not found in user repos, try getting from all repos
        if (!repo) {
          const allRepos = await getAllRepositories();
          repo = allRepos.find(r => r.$id === selectedRepo);
        }
        
        if (repo) {
          setRepoData(repo);
        }
      } catch (error) {
        console.error('Error fetching repository data:', error);
      }
    };
    
    fetchRepoData();
  }, [selectedRepo]);

  const handleRepoSelect = (repoId) => {
    setSelectedRepo(repoId);
  };

  const handleAddRepoSuccess = (newRepo) => {
    setSelectedRepo(newRepo.$id);
    setRepoData(newRepo);
  // Trigger immediate UI refresh; server function is already called during add
  setRefreshKey((k) => k + 1);
  };

  const handleTagsChange = (tags) => {
    setSelectedTags(tags);
  };

  const handleRefreshIssues = async () => {
    if (!selectedRepo) {
      console.error('No selectedRepo for refresh');
      return;
    }
    
    console.log('handleRefreshIssues called with selectedRepo:', {
      selectedRepo,
      type: typeof selectedRepo,
      length: selectedRepo?.length,
      repoData: repoData ? { $id: repoData.$id, full_name: repoData.full_name } : null
    });
    
    try {
      setRefreshing(true);
      console.log('Refreshing issues for repo:', selectedRepo);
      const result = await fetchRepositoryIssues(selectedRepo, { wait: true, timeoutMs: 30000 });
      console.log('Refresh result:', result);
      setRefreshKey((k) => k + 1);
      // update lastSyncedAt locally
      setRepoData((prev) => prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : prev);
    } catch (e) {
      console.error('Issue refresh failed:', e);
      alert(`Failed to refresh issues: ${e.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedRepo || !repoData) return;
    const ok = window.confirm(`Delete repository "${repoData.full_name}"? This will also delete its issues.`);
    if (!ok) return;
    try {
      setLoading(true);
      await deleteRepository(selectedRepo, { deleteIssues: true });
      // Clear selection and reload lists
      setSelectedRepo(null);
      setRepoData(null);
      // Trigger a lightweight refresh cycle
      setRefreshKey((k) => k + 1);
    } catch (e) {
      console.error('Delete repo failed:', e);
      alert(e?.message || 'Failed to delete repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <AddRepo onAddSuccess={handleAddRepoSuccess} />
            </motion.div>
            
            {loading ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex justify-center">
                <div className="animate-spin h-6 w-6 border-4 border-[#f02e65] border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <RepoDashboard 
                  repoId={selectedRepo} 
                  onSelectRepo={handleRepoSelect}
                  onDeleted={() => {
                    if (selectedRepo && repoData) {
                      setSelectedRepo(null);
                      setRepoData(null);
                      setRefreshKey((k) => k + 1);
                    }
                  }}
                  onRefreshed={() => {
                    setRefreshKey((k) => k + 1);
                    setRepoData((prev) => prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : prev);
                  }}
                />
              </motion.div>
            )}
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-6 space-y-6">
            {loading ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-[#f02e65] border-t-transparent rounded-full"></div>
              </div>
            ) : selectedRepo ? (
              <>
                {repoData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <h2 className="text-xl font-bold text-white mb-2">{repoData.full_name}</h2>
                        <p className="text-gray-400 text-sm">
                          {repoData.lastSyncedAt 
                            ? `Last updated: ${new Date(repoData.lastSyncedAt).toLocaleString()}`
                            : 'Not yet synced'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleRefreshIssues}
                          disabled={refreshing}
                          className={`px-4 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                            refreshing 
                              ? 'bg-gray-600 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-[#2de0c0] to-[#00d4aa] hover:shadow-lg hover:shadow-[#2de0c0]/25 hover:scale-105'
                          }`}
                        >
                          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                          {refreshing ? 'Refreshing…' : 'Refresh'}
                        </button>
                        <button
                          onClick={handleDeleteSelected}
                          disabled={loading}
                          className={`px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all duration-300 ${
                            loading 
                              ? 'bg-gray-600 cursor-not-allowed' 
                              : 'bg-red-600 hover:bg-red-700 hover:scale-105'
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <TagsFilter 
                    repoId={selectedRepo} 
                    selectedTags={selectedTags} 
                    onChange={handleTagsChange}
                    refreshKey={refreshKey}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <IssuesList 
                    repoId={selectedRepo} 
                    selectedTags={selectedTags}
                    refreshKey={refreshKey}
                  />
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Github size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Get Started!</h2>
                <p className="text-gray-400 text-lg mb-8">
                  Add your first repository to discover beginner-friendly open source issues.
                </p>
                <div className="bg-[#f02e65]/10 border border-[#f02e65]/20 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-[#f02e65] mb-4">Getting Started:</h3>
                  <ol className="text-left text-gray-300 space-y-3 pl-5 list-decimal">
                    <li>Add a GitHub repository using the form on the left</li>
                    <li>Select a repository to view its issues</li>
                    <li>Filter issues by tags to find beginner-friendly tasks</li>
                    <li>View issues on GitHub to start contributing</li>
                  </ol>
                </div>
                <p className="text-gray-500">
                  Add your first GitHub repository to get started!
                </p>
              </motion.div>
            )}
          </div>
          
          {/* Right sidebar */}
          <div className="lg:col-span-3">
            {selectedRepo && repoData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <RepoChat 
                  repoId={selectedRepo} 
                  repoName={repoData.full_name} 
                />
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
