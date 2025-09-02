import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, User, LogOut, Bookmark, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Header() {
	const { user, logout } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const onLogout = async () => {
		try {
			await logout();
			navigate('/auth');
		} catch (e) {
			console.error('Logout failed', e);
		}
	};

	return (
		<>
			<motion.header 
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.6 }}
				className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
			>
				<div className="container mx-auto px-6 py-4 flex items-center justify-between">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-3 group">
						<div className="w-10 h-10 bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
							<Github size={24} className="text-white" />
						</div>
						<span className="text-xl font-bold bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] text-transparent bg-clip-text">
							GoodFirstHub
						</span>
					</Link>

					{/* Navigation */}
					<nav className="flex items-center gap-6">
						<Link
							to="/home"
							className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
								location.pathname === '/home' 
								? 'bg-[#f02e65]/20 text-[#f02e65] border border-[#f02e65]/30' 
								: 'text-gray-300 hover:text-white hover:bg-white/10'
							}`}
						>
							<Home size={18} />
							Dashboard
						</Link>
						<Link
							to="/bookmarks"
							className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
								location.pathname === '/bookmarks' 
								? 'bg-[#2de0c0]/20 text-[#2de0c0] border border-[#2de0c0]/30' 
								: 'text-gray-300 hover:text-white hover:bg-white/10'
							}`}
						>
							<Bookmark size={18} />
							Bookmarks
						</Link>
						
						{user ? (
							<>
								<Link
									to="/profile"
									className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
										location.pathname === '/profile' 
										? 'bg-white/20 text-white border border-white/30' 
										: 'text-gray-300 hover:text-white hover:bg-white/10'
									}`}
								>
									<div className="w-6 h-6 bg-gradient-to-r from-[#2de0c0] to-[#00d4aa] rounded-lg flex items-center justify-center text-xs font-bold text-white">
										{user.name ? user.name.charAt(0).toUpperCase() : 'U'}
									</div>
									<span>{user.name || 'Profile'}</span>
								</Link>
								<button 
									onClick={onLogout} 
									className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-xl hover:bg-red-600/30 transition-all duration-300 text-red-300 font-semibold text-sm"
								>
									<LogOut size={16} />
									Logout
								</button>
							</>
						) : (
							<Link 
								to="/auth" 
								className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] rounded-xl hover:shadow-lg hover:shadow-[#f02e65]/25 transition-all duration-300 text-white font-semibold text-sm"
							>
								<User size={16} />
								Sign in
							</Link>
						)}
					</nav>
				</div>
			</motion.header>
			<div className="h-20"></div> {/* Spacer for fixed header */}
		</>
	);
}

export default Header;
