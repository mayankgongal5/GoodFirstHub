import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Loader } from 'lucide-react';
import { getRepositoryLabels } from '../utils/githubUtils';

function TagsFilter({ repoId, selectedTags = [], onChange, refreshKey = 0 }) {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        setLoading(true);
        const labelsData = await getRepositoryLabels(repoId);
        setLabels(labelsData);
      } catch (error) {
        console.error('Failed to fetch labels:', error);
        setError('Failed to load labels');
      } finally {
        setLoading(false);
      }
    };

    if (repoId) {
      fetchLabels();
    }
  }, [repoId, refreshKey]);

  const handleTagClick = (tagName) => {
    let newSelectedTags;
    
    if (selectedTags.includes(tagName)) {
      // If tag is already selected, remove it (deselect)
      newSelectedTags = [];
    } else {
      // If tag is not selected, select only this tag (replace any existing selection)
      newSelectedTags = [tagName];
    }
    
    onChange(newSelectedTags);
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-2 p-6 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10"
      >
        <Loader size={16} className="animate-spin text-[#2de0c0]" />
        <span className="text-gray-300">Loading tags...</span>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-400 p-6 bg-red-500/10 backdrop-blur-xl rounded-2xl border border-red-500/20"
      >
        {error}
      </motion.div>
    );
  }

  if (labels.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-400 p-6 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 text-center"
      >
        <Tag size={24} className="mx-auto mb-2 text-gray-500" />
        No labels found for this repository.
      </motion.div>
    );
  }

  // Sort labels by count (most frequent first)
  const sortedLabels = [...labels].sort((a, b) => b.count - a.count);
  
  // Check if "good first issue" exists and highlight it
  const goodFirstIssueIndex = sortedLabels.findIndex(label => 
    label.name.toLowerCase() === 'good first issue' || 
    label.name.toLowerCase() === 'good-first-issue'
  );
  
  // If "good first issue" exists, move it to the front
  if (goodFirstIssueIndex !== -1) {
    const goodFirstIssue = sortedLabels.splice(goodFirstIssueIndex, 1)[0];
    sortedLabels.unshift(goodFirstIssue);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-[#2de0c0] to-[#00d4aa] rounded-xl flex items-center justify-center">
          <Tag size={16} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Filter by Tags</h3>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-[#2de0c0]">Tip:</span> Look for "good first issue" tags for beginner-friendly tasks.
        </p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {sortedLabels.map((label, index) => {
          const isSelected = selectedTags.includes(label.name);
          const isGoodFirstIssue = 
            label.name.toLowerCase() === 'good first issue' || 
            label.name.toLowerCase() === 'good-first-issue';
          
          return (
            <motion.div 
              key={label.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => handleTagClick(label.name)}
              className={`
                cursor-pointer rounded-xl px-4 py-2 text-sm font-medium
                flex items-center justify-between gap-2 border transition-all duration-300
                ${isSelected
                  ? isGoodFirstIssue
                    ? 'bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] text-white border-[#f02e65] shadow-lg shadow-[#f02e65]/25'
                    : 'bg-[#2de0c0]/20 text-[#2de0c0] border-[#2de0c0] shadow-lg shadow-[#2de0c0]/25'
                  : isGoodFirstIssue
                    ? 'bg-[#f02e65]/10 text-[#f02e65] border-[#f02e65]/30 hover:bg-[#f02e65]/20'
                    : 'bg-white/5 text-gray-300 border-white/20 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <span>{label.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                isSelected 
                  ? 'bg-white/20 text-white' 
                  : 'bg-black/20 text-gray-400'
              }`}>
                {label.count}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default TagsFilter;
