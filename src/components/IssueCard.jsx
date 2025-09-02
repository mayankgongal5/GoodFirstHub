import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Bookmark, Calendar, Hash } from 'lucide-react';
import { bookmarkIssue, removeBookmarkByIssue, isIssueBookmarked } from '../utils/userActions';
import { useAuth } from '../context/AuthContext';

function IssueCard({ issue, onAction }) {
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [checkingBookmark, setCheckingBookmark] = useState(false);
  const { user } = useAuth();

  // Check if issue is already bookmarked
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (user && issue.$id) {
        try {
          setCheckingBookmark(true);
          const isBookmarked = await isIssueBookmarked(user.$id, issue.$id);
          setBookmarked(isBookmarked);
        } catch (error) {
          console.error('Failed to check bookmark status:', error);
        } finally {
          setCheckingBookmark(false);
        }
      }
    };

    checkBookmarkStatus();
  }, [user, issue.$id]);

  // Format date to be more readable
  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleBookmark = async () => {
    if (!user) {
      alert('Please login to bookmark issues');
      return;
    }

    try {
      setLoading(true);
      
      if (bookmarked) {
        // Remove bookmark
        await removeBookmarkByIssue(user.$id, issue.$id);
        setBookmarked(false);
        if (onAction) onAction('unbookmark', issue);
      } else {
        // Add bookmark
        await bookmarkIssue(user.$id, issue.$id);
        setBookmarked(true);
        if (onAction) onAction('bookmark', issue);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      alert('Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/5 transition-all duration-300 group"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          {/* Issue number and date */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-[#f02e65]/20 rounded-xl text-sm font-mono text-[#f02e65] border border-[#f02e65]/30 flex items-center gap-2">
              <Hash size={14} />
              {issue.number}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Calendar size={14} />
              {formattedDate}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleBookmark}
              disabled={loading || checkingBookmark}
              className={`p-2 rounded-xl text-sm transition-all duration-300 flex items-center gap-1 ${
                bookmarked
                  ? 'bg-yellow-500/20 text-yellow-400 cursor-pointer border border-yellow-500/30 hover:bg-yellow-500/30'
                  : 'hover:bg-white/10 text-gray-400 hover:text-white border border-white/20'
              } ${(loading || checkingBookmark) ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark this issue'}
            >
              <Bookmark size={16} className={bookmarked ? 'fill-current' : ''} />
            </button>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-white group-hover:text-[#f02e65] transition-colors duration-300">{issue.title}</h3>
        
        {/* Labels/tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {issue.labels && issue.labels.map((label, index) => (
            <span
              key={label}
              className={`px-3 py-1 text-xs rounded-full font-medium border transition-all duration-300 ${
                index % 3 === 0 ? 'bg-[#f02e65]/20 text-[#f02e65] border-[#f02e65]/30' :
                index % 3 === 1 ? 'bg-[#2de0c0]/20 text-[#2de0c0] border-[#2de0c0]/30' :
                'bg-purple-500/20 text-purple-400 border-purple-500/30'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
        
        {/* Description preview - truncated */}
        <div className="mt-4 text-sm text-gray-300 line-clamp-3">
          {issue.body ? issue.body.substring(0, 150) + (issue.body.length > 150 ? '...' : '') : 'No description provided.'}
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <a
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-all duration-300 text-white font-medium border border-white/20 group-hover:border-[#2de0c0]/30"
          >
            <span>View on GitHub</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default IssueCard;
