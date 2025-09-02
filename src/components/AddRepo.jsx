import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Plus } from 'lucide-react';
import { addRepository } from '../utils/githubUtils';
import { useAuth } from '../context/AuthContext';
import { account } from '../lib/appwrite';

function AddRepo({ onAddSuccess }) {
  const [repoInput, setRepoInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to add repositories');
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1500);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!repoInput.trim()) {
        throw new Error('Please enter a repository URL or owner/repo name');
      }

      console.log('Adding repository:', repoInput);
      const repo = await addRepository(repoInput, user.$id);
      console.log('Repository added successfully:', repo);
      
      setRepoInput('');
      if (onAddSuccess) {
        onAddSuccess(repo);
      }
      
      // Show success message
      setError('Repository added successfully!');
      setTimeout(() => setError(''), 3000);
      
    } catch (error) {
      console.error('Failed to add repository:', {
        error,
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      let errorMessage = error.message || 'Failed to add repository';
      
      // Handle specific error cases
      if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = 'Session expired. Please log in again.';
        // Force logout and redirect
        try {
          await logout();
          window.location.href = '/auth';
        } catch (e) {
          console.error('Error during logout:', e);
        }
      } else if (error.message.includes('429')) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] rounded-xl flex items-center justify-center">
          <Github size={20} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">Add Repository</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="repoInput" className="block text-sm font-semibold mb-3 text-gray-200">
            GitHub Repository URL or owner/repo
          </label>
          <input
            id="repoInput"
            type="text"
            className="w-full p-4 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl focus:border-[#f02e65] focus:outline-none focus:ring-2 focus:ring-[#f02e65]/20 text-white placeholder-gray-400 transition-all duration-300"
            placeholder="e.g., github.com/user/repo or user/repo"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            disabled={loading}
          />
          <p className="mt-2 text-xs text-gray-400">
            Enter a GitHub repository URL or use the owner/repo format
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-4 p-4 rounded-xl border ${
              error.includes('successfully') 
                ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading || !user}
          className={`w-full py-4 px-6 rounded-xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            loading || !user
              ? 'bg-gray-600/50 cursor-not-allowed border border-gray-500/30' 
              : 'bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] hover:shadow-lg hover:shadow-[#f02e65]/25 border border-[#f02e65]/30'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Adding Repository...
            </>
          ) : (
            <>
              <Plus size={20} />
              Add Repository
            </>
          )}
        </button>
      </form>
      
      <div className="mt-6 text-sm">
        <p className="text-gray-400">
          We'll fetch issues and labels automatically after adding the repository.
        </p>
      </div>
    </motion.div>
  );
}

export default AddRepo;
