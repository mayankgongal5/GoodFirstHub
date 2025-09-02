import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, GitFork, Eye } from 'lucide-react';

const ExplorePage = () => {
  const repositories = [
    {
      id: 1,
      name: "awesome-react-components",
      description: "Curated list of awesome React components and libraries",
      stars: 1234,
      forks: 456,
      watchers: 789,
      language: "JavaScript",
      updated: "2 hours ago"
    },
    {
      id: 2,
      name: "modern-ui-kit",
      description: "Beautiful and modern UI components for React applications",
      stars: 892,
      forks: 234,
      watchers: 567,
      language: "TypeScript",
      updated: "1 day ago"
    },
    {
      id: 3,
      name: "appwrite-integrations",
      description: "Collection of Appwrite integrations and examples",
      stars: 456,
      forks: 123,
      watchers: 234,
      language: "JavaScript",
      updated: "3 days ago"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] rounded-xl flex items-center justify-center">
              <Search size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">
                Explore <span className="bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] bg-clip-text text-transparent">Repositories</span>
              </h1>
              <p className="text-gray-400 text-xl">
                Discover amazing projects and repositories from the community
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-4 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search repositories..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f02e65] focus:border-transparent transition-all"
              />
            </div>
            <button className="px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/20 hover:border-[#f02e65]/50 transition-all duration-300 flex items-center gap-2 font-semibold">
              <Filter size={20} />
              Filters
            </button>
          </div>
        </motion.div>

        {/* Repository Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="group"
            >
              <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-[#f02e65]/30 hover:scale-105 transition-all duration-300 h-full">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#f02e65] transition-colors">
                    {repo.name}
                  </h3>
                  <div className="text-xs px-3 py-1 bg-[#2de0c0]/20 border border-[#2de0c0]/30 rounded-full text-[#2de0c0] font-semibold">
                    {repo.language}
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {repo.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-[#f02e65]" />
                      {repo.stars}
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork size={16} className="text-[#2de0c0]" />
                      {repo.forks}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={16} className="text-gray-400" />
                      {repo.watchers}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Updated {repo.updated}</span>
                  <button className="px-4 py-2 bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] rounded-xl hover:shadow-lg hover:shadow-[#f02e65]/25 hover:scale-105 transition-all duration-300 text-sm font-semibold">
                    View Repo
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <button className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/20 hover:border-[#f02e65]/50 transition-all duration-300 font-semibold">
            Load More Repositories
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ExplorePage;
