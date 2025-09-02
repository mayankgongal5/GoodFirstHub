import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, ArrowRight } from 'lucide-react';
import Login from '../components/Login';
import Register from '../components/Register';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  // Redirect to home when logged in
  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#0d0d0d]">
      {/* Background with floating shapes */}
      <div className="absolute inset-0">
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-gradient-to-r from-[#f02e65]/20 to-[#ff6b9d]/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -left-24 w-72 h-72 bg-gradient-to-r from-[#2de0c0]/20 to-[#00d4aa]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-[#ff6b9d]/20 to-[#f02e65]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-gradient-to-r from-[#2de0c0]/10 to-[#f02e65]/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] rounded-2xl flex items-center justify-center mr-4">
              <Github size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">GoodFirstHub</h1>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Start Your
            <br />
            <span className="bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] bg-clip-text text-transparent">
              Open Source Journey
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Discover beginner-friendly GitHub issues, connect with the community, and make your first contribution with confidence.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#f02e65] rounded-full"></div>
              <span className="text-gray-300">Smart issue tagging and filtering</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#2de0c0] rounded-full"></div>
              <span className="text-gray-300">Real-time collaboration tools</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#ff6b9d] rounded-full"></div>
              <span className="text-gray-300">Beginner-friendly community</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#2de0c0] font-semibold">
            <span>Join 500+ new contributors</span>
            <ArrowRight size={20} />
          </div>
        </motion.div>

        {/* Right side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          {showLogin ? (
            <Login onToggleForm={toggleForm} />
          ) : (
            <Register onToggleForm={toggleForm} />
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default AuthPage;
