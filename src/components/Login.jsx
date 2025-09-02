import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login({ onToggleForm }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGitHub, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
  navigate('/', { replace: true });
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      await loginWithGitHub();
    } catch (error) {
      setError(error.message || 'GitHub login failed');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-xl backdrop-blur-lg bg-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20">
      <h2 className="text-2xl font-medium text-center text-[#1A1A1F] mb-2">
        Sign in to <span className="text-[#FD366E] font-semibold">BeginnerContribute</span>
      </h2>
      
      <p className="text-center text-gray-600 mb-6 text-sm">
        Sign in to continue your journey
      </p>
      
      <div className="mb-6 p-3 bg-blue-50/80 border border-blue-200/50 rounded-lg backdrop-blur-sm">
        <p className="text-xs text-blue-700 font-medium mb-1">Example login:</p>
        <p className="text-xs text-blue-600">Email: test@test.in</p>
        <p className="text-xs text-blue-600">Password: 12345678</p>
      </div>
      
      {error && (
        <div className="mb-5 p-3 bg-[#FF453A1A] text-[#B31212] rounded-lg text-sm backdrop-blur-sm border border-[#FF453A40]">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="group">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 transition-all group-focus-within:text-[#FD366E]">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FD366E]/50 focus:border-[#FD366E] transition-all outline-none backdrop-blur-sm"
              placeholder="you@example.com"
            />
          </div>
        </div>
        
        <div className="group">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 transition-all group-focus-within:text-[#FD366E]">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FD366E]/50 focus:border-[#FD366E] transition-all outline-none backdrop-blur-sm"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 bg-[#FD366E] text-white rounded-lg font-medium transition-all ${
            loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e02e61] shadow-lg hover:shadow-[#FD366E]/30'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200/50"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2.5 bg-white/30 text-gray-600 backdrop-blur-sm">Or continue with</span>
        </div>
      </div>
      
      <div className="mt-5">
        <button
          type="button"
          onClick={handleGitHubLogin}
          className="w-full flex items-center justify-center gap-3 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>Sign in with GitHub</span>
        </button>
      </div>
      
      <div className="mt-7 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button 
            onClick={onToggleForm} 
            className="text-[#FD366E] font-medium hover:text-[#e02e61] transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
