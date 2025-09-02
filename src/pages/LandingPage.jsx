import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Github, 
  Search, 
  MessageCircle, 
  Filter,
  Users,
  Star,
  GitPullRequest,
  ChevronRight,
  ExternalLink,
  Play,
  Check,
  Zap,
  Heart
} from 'lucide-react';
import FloatingShapes from '../components/FloatingShapes';
import AuthModal from '../components/AuthModal';

const LandingPage = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white overflow-hidden">
      <FloatingShapes />
      
      {/* Hero Section */}
      <HeroSection openAuthModal={openAuthModal} />
      
      {/* How It Works Section */}
      <HowItWorksSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Community Proof Section */}
      <CommunitySection />
      
      {/* Footer */}
      <Footer />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authMode}
      />
    </div>
  );
};

const HeroSection = ({ openAuthModal }) => {
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { once: true });

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-32">
      <div className="text-center z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] rounded-2xl flex items-center justify-center mr-4">
              <Github size={32} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              GoodFirstHub
            </h1>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Start Contributing
            <br />
            <span className="bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] bg-clip-text text-transparent">
              with Confidence
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
            GoodFirstHub fetches beginner-friendly GitHub issues and organizes them with smart tags 
            to kickstart your open source journey.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <motion.button
            onClick={() => openAuthModal('register')}
            className="px-8 py-4 bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] rounded-2xl hover:shadow-2xl hover:shadow-[#f02e65]/25 transition-all duration-300 flex items-center gap-3 text-lg font-semibold group"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={20} />
            Get Started for Free
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
          
          <motion.button
            onClick={() => openAuthModal('login')}
            className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/20 hover:border-[#f02e65]/50 transition-all duration-300 flex items-center gap-3 text-lg font-semibold"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search size={20} />
            Explore Issues
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-[#f02e65] mb-2">beginner</div>
            <div className="text-gray-400">Open Issues</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#f02e65] mb-2">GitHub</div>
            <div className="text-gray-400">Repositories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#f02e65] mb-2">100%</div>
            <div className="text-gray-400">Beginner Friendly</div>
          </div>
        </motion.div>
      </div>

      {/* Floating Issue Cards Preview */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-4"
        >
          {['good first issue', 'help wanted', 'documentation'].map((tag, index) => (
            <div key={tag} className="w-64 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-[#f02e65] rounded-full"></div>
                <span className="text-xs px-2 py-1 bg-[#f02e65]/20 text-[#f02e65] rounded-full">{tag}</span>
              </div>
              <h4 className="text-sm font-semibold mb-1">Fix documentation typo</h4>
              <p className="text-xs text-gray-400">Easy fix for beginners</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true });

  const steps = [
    {
      number: "01",
      icon: Github,
      title: "Add a GitHub Repo",
      description: "Connect any open source project by simply pasting the repository URL.",
      color: "from-[#f02e65] to-[#ff6b9d]"
    },
    {
      number: "02",
      icon: Filter,
      title: "Auto-Fetch Issues",
      description: "We organize issues by tags like 'good first issue', 'help wanted', and more.",
      color: "from-[#2de0c0] to-[#00d4aa]"
    },
    {
      number: "03",
      icon: GitPullRequest,
      title: "Contribute",
      description: "Pick a task, collaborate with the community, and grow your skills.",
      color: "from-[#ff6b9d] to-[#f02e65]"
    }
  ];

  return (
    <section ref={sectionRef} className="py-32 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold mb-6">
            How It <span className="bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Get started with open source contributions in three simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative group"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#f02e65]/50 to-transparent z-0" />
              )}
              
              <div className="relative z-10 text-center">
                {/* Step Number */}
                <div className="inline-block text-6xl font-bold text-gray-800 mb-4">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon size={40} className="text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 text-white">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 text-[#2de0c0] font-semibold">
            <Zap size={20} />
            Ready to make your first contribution?
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true });

  const features = [
    {
      icon: Filter,
      title: "Smart Tagging of Issues",
      description: "Automatically categorize issues with intelligent tags like 'good first issue', 'help wanted', and difficulty levels.",
      gradient: "from-[#f02e65] to-[#ff6b9d]"
    },
    {
      icon: Search,
      title: "Beginner-Friendly Filters",
      description: "Advanced filtering system to find issues perfect for your skill level and interests.",
      gradient: "from-[#2de0c0] to-[#00d4aa]"
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications when new beginner-friendly issues are posted using Appwrite's real-time capabilities.",
      gradient: "from-[#ff6b9d] to-[#f02e65]"
    },
    {
      icon: MessageCircle,
      title: "Messaging & Collaboration",
      description: "Connect with maintainers and fellow contributors through integrated messaging and discussion features.",
      gradient: "from-[#2de0c0] to-[#f02e65]"
    }
  ];

  return (
    <section ref={sectionRef} className="py-32 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold mb-6">
            Powerful <span className="bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to start contributing to open source projects with confidence
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group"
            >
              <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 hover:border-[#f02e65]/20 transition-all duration-300 h-full hover:scale-105">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CommunitySection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true });

  const avatars = [
    { name: "Alice", color: "from-[#f02e65] to-[#ff6b9d]" },
    { name: "Bob", color: "from-[#2de0c0] to-[#00d4aa]" },
    { name: "Charlie", color: "from-[#ff6b9d] to-[#f02e65]" },
    { name: "Diana", color: "from-[#00d4aa] to-[#2de0c0]" },
    { name: "Eve", color: "from-[#f02e65] to-[#2de0c0]" }
  ];

  return (
    <section ref={sectionRef} className="py-32 px-4 relative z-10">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl mb-8">
            <blockquote className="text-2xl md:text-3xl font-bold text-white mb-6 leading-relaxed">
              "Every expert was once a beginner.<br />
              <span className="bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] bg-clip-text text-transparent">
                Start your journey today.
              </span>"
            </blockquote>
          </div>

          {/* Community Avatars */}
          <div className="flex justify-center items-center mb-8">
            <div className="flex -space-x-3">
              {avatars.map((avatar, index) => (
                <motion.div
                  key={avatar.name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className={`w-12 h-12 bg-gradient-to-r ${avatar.color} rounded-full flex items-center justify-center text-white font-bold border-2 border-[#0d0d0d] hover:scale-110 transition-transform cursor-pointer`}
                >
                  {avatar.name[0]}
                </motion.div>
              ))}
            </div>
            <div className="ml-4 text-left">
              <div className="text-white font-semibold">Join 500+ contributors</div>
              <div className="text-gray-400 text-sm">making their first open source contributions</div>
            </div>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="text-[#f02e65] mr-2" size={24} />
                <span className="text-2xl font-bold text-white">4.9/5</span>
              </div>
              <div className="text-gray-400">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Github className="text-[#f02e65] mr-2" size={24} />
                <span className="text-2xl font-bold text-white">2.5k+</span>
              </div>
              <div className="text-gray-400">Issues Solved</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="text-[#f02e65] mr-2" size={24} />
                <span className="text-2xl font-bold text-white">98%</span>
              </div>
              <div className="text-gray-400">Success Rate</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const FutureEnhancementsSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true });

  const enhancements = [
    {
      title: "Advanced Chat Features",
      description: "File sharing, message reactions, and emoji support",
      status: "Planning"
    },
    {
      title: "GitHub PR Integration",
      description: "Pull requests and commit tracking integration",
      status: "In Progress"
    },
    {
      title: "Role-Based Access Control",
      description: "Advanced permission system for enterprise use",
      status: "Future"
    }
  ];

  return (
    <section ref={sectionRef} className="py-32 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
            Future Enhancements
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Exciting features and improvements coming soon.
          </p>
        </motion.div>

        <div className="space-y-6">
          {enhancements.map((enhancement, index) => (
            <motion.div
              key={enhancement.title}
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="flex items-center gap-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{enhancement.title}</h3>
                <p className="text-white/70">{enhancement.description}</p>
              </div>
              <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-semibold">
                {enhancement.status}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-16 px-4 relative z-10 border-t border-white/10 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] rounded-xl flex items-center justify-center mr-3">
                <Github size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">GoodFirstHub</h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Your gateway to beginner-friendly open source contributions. Start your journey today and become part of the global developer community.
            </p>
            <div className="flex items-center gap-2 text-[#2de0c0] text-sm">
              <span>Built with</span>
              <Heart size={16} className="text-[#f02e65]" />
              <span>and Appwrite</span>
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <p className="text-sm">Created for Appwrite Hackathon</p>
              </li>
              <li>
                <a 
                  href="https://github.com/mayankgongal5" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#f02e65] transition-colors flex items-center gap-2 text-sm"
                >
                  by @mayankgongal5
                  <ExternalLink size={14} />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; 2025 GoodFirstHub. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-[#f02e65] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#f02e65] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#f02e65] transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingPage;
