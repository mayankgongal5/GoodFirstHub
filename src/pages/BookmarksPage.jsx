import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Github, Calendar, ExternalLink, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserBookmarksWithDetails, removeBookmark } from '../utils/userActions';

function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchBookmarks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userBookmarks = await getUserBookmarksWithDetails(user.$id);
      setBookmarks(userBookmarks);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
      setError('Failed to load bookmarks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId, issueTitle) => {
    if (!window.confirm(`Are you sure you want to remove "${issueTitle}" from your bookmarks?`)) {
      return;
    }

    try {
      await removeBookmark(bookmarkId, user.$id);
      // Remove the bookmark from the local state
      setBookmarks(prev => prev.filter(bookmark => bookmark.bookmarkId !== bookmarkId));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      alert('Failed to remove bookmark. Please try again.');
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <div className="animate-spin w-6 h-6 border-2 border-[#f02e65] border-t-transparent rounded-full"></div>
              <span className="text-gray-300">Loading bookmarks...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchBookmarks}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 border border-red-500/30 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
              <div className="w-20 h-20 bg-[#f02e65]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#f02e65]/30">
                <Bookmark size={32} className="text-[#f02e65]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                Please login to view your bookmarked issues.
              </p>
              <a
                href="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f02e65] to-[#d91c47] rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-[#f02e65]/25 transition-all duration-300"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-[#2de0c0] to-[#00d4aa] rounded-2xl flex items-center justify-center">
              <Bookmark size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Bookmarked Issues</h1>
              <p className="text-gray-400">Your saved beginner-friendly issues</p>
            </div>
          </div>
        </motion.div>

        {bookmarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center"
          >
            <div className="w-20 h-20 bg-[#2de0c0]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#2de0c0]/30">
              <Bookmark size={32} className="text-[#2de0c0]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Bookmarks Yet</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Start bookmarking interesting issues from the dashboard to build your personal collection of contribution opportunities.
            </p>
            <a
              href="/home"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2de0c0] to-[#00d4aa] rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-[#2de0c0]/25 transition-all duration-300"
            >
              <Github size={20} />
              Browse Issues
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark, index) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-[#f02e65]/20 rounded-xl text-sm font-mono text-[#f02e65] border border-[#f02e65]/30">
                      #{bookmark.number}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Calendar size={14} />
                      {bookmark.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bookmark size={16} className="text-[#2de0c0] fill-current" />
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.bookmarkId, bookmark.title)}
                      className="p-1 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-all duration-300"
                      title="Remove bookmark"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white group-hover:text-[#f02e65] transition-colors duration-300 mb-3">
                  {bookmark.title}
                </h3>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {bookmark.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {bookmark.labels?.map((label, labelIndex) => (
                    <span
                      key={label}
                      className={`px-2 py-1 text-xs rounded-full font-medium border ${
                        labelIndex % 3 === 0 ? 'bg-[#f02e65]/20 text-[#f02e65] border-[#f02e65]/30' :
                        labelIndex % 3 === 1 ? 'bg-[#2de0c0]/20 text-[#2de0c0] border-[#2de0c0]/30' :
                        'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{bookmark.repository}</span>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-all duration-300"
                  >
                    <ExternalLink size={14} />
                    View
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookmarksPage;
