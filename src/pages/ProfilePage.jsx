import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, BookmarkIcon, LogOut, Mail, Calendar, Github, Star, GitPullRequest } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserBookmarks } from '../utils/userActions';
import { avatars } from '../lib/appwrite';

function ProfilePage() {
  const { user, logout } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        if (user) {
          const userBookmarks = await getUserBookmarks(user.$id);
          setBookmarks(userBookmarks);
        }
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
        setError('Failed to load your bookmarks');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return null; // Should redirect to login in practice
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] rounded-xl flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Your Profile</h1>
              <p className="text-gray-400">Manage your account and contributions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column - User info */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
            >
              {/* Cover */}
              <div className="bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] h-32 relative">
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              
              <div className="px-6 pb-6 relative">
                {/* Profile Picture */}
                <div className="absolute -top-12 left-6 h-24 w-24 rounded-2xl overflow-hidden border-4 border-[#0d0d0d] bg-gradient-to-r from-[#2de0c0] to-[#00d4aa]">
                  <div className="h-full w-full flex items-center justify-center text-white text-2xl font-bold">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="pt-16">
                  <h2 className="text-xl font-bold text-white">{user.name || 'User'}</h2>
                  <p className="text-gray-400 mt-1 flex items-center gap-2">
                    <Mail size={16} />
                    {user.email}
                  </p>
                  <p className="text-gray-400 mt-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Member since {new Date(user.$createdAt).toLocaleDateString()}
                  </p>
                  
                  {/* Stats */}
                  <div className="mt-6">
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <div className="text-xl font-bold text-[#f02e65]">{bookmarks.length}</div>
                      <div className="text-xs text-gray-400">Bookmarks</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <button className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 hover:border-[#f02e65]/50 transition-all duration-300 text-white font-semibold flex items-center justify-center gap-2">
                      <Github size={18} />
                      Connect GitHub
                    </button>
                    <button 
                      onClick={handleLogout} 
                      className="w-full py-3 px-4 bg-red-600/20 border border-red-500/30 rounded-xl hover:bg-red-600/30 transition-all duration-300 text-red-300 font-semibold flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Right column - Bookmarks and activity */}
          <div className="lg:col-span-8 space-y-8">
            {/* Bookmarks Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <BookmarkIcon className="text-[#f02e65]" size={24} />
                <h2 className="text-xl font-bold text-white">Your Bookmarks</h2>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-[#f02e65] border-t-transparent rounded-full"></div>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
                  {error}
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="text-center py-8">
                  <BookmarkIcon className="mx-auto mb-4 text-gray-500" size={48} />
                  <p className="text-gray-400 text-lg">You haven't bookmarked any issues yet.</p>
                  <p className="text-gray-500 mt-2">Start exploring repositories and bookmark issues that interest you.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookmarks.map((bookmark) => (
                    <div key={bookmark.$id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-white">{bookmark.issueId}</h3>
                          <p className="text-sm text-gray-400">
                            Bookmarked on: {new Date(bookmark.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] rounded-xl hover:shadow-lg hover:shadow-[#f02e65]/25 transition-all duration-300 text-white font-semibold text-sm">
                          View Issue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
