import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md relative z-10">
      {/* Top saffron stripe */}
      <div className="h-1.5 bg-[#FF9933]"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[#0C2D83]">OCP</span>
                <div className="flex space-x-0.5 mt-0.5">
                  <div className="w-3 h-0.5 bg-[#FF9933]"></div>
                  <div className="w-3 h-0.5 bg-white"></div>
                  <div className="w-3 h-0.5 bg-[#138808]"></div>
                </div>
              </div>
              <span className="hidden md:inline-block text-sm font-medium text-gray-600">
                {t('app.fullName', 'Online Complaint Portal')}
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-[#0C2D83] font-medium transition-colors">
              {t('nav.home', 'Home')}
            </Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-[#0C2D83] font-medium transition-colors">
              {t('dashboard.title', 'Dashboard')}
            </Link>
            <Link to="/track" className="text-gray-700 hover:text-[#0C2D83] font-medium transition-colors">
              {t('complaints.trackComplaint', 'Track Complaint')}
            </Link>
            <Link to="/project-report" className="text-gray-700 hover:text-[#0C2D83] font-medium transition-colors">
              {t('projectReport', 'Project Report')}
            </Link>
          </nav>
          
          {/* Auth and Language Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            
            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-3 py-1.5 text-[#0C2D83] font-medium hover:text-[#154DB8] transition-colors">
                  {t('auth.login', 'Login')}
                </Link>
                <Link to="/register" className="px-3 py-1.5 bg-[#0C2D83] text-white rounded-md hover:bg-[#0A2668] transition-colors">
                  {t('auth.register', 'Register')}
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#0C2D83] rounded-full flex items-center justify-center text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-gray-700 font-medium">{user?.name || t('auth.profile', 'Profile')}</span>
                </Link>
                <button onClick={handleLogout} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                  {t('auth.logout', 'Logout')}
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3 mb-4">
              <Link to="/" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={() => setIsMenuOpen(false)}>
                {t('nav.home', 'Home')}
              </Link>
              <Link to="/dashboard" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={() => setIsMenuOpen(false)}>
                {t('dashboard.title', 'Dashboard')}
              </Link>
              <Link to="/track" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={() => setIsMenuOpen(false)}>
                {t('complaints.trackComplaint', 'Track Complaint')}
              </Link>
              <Link to="/project-report" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={() => setIsMenuOpen(false)}>
                {t('projectReport', 'Project Report')}
              </Link>
            </nav>
            
            <div className="py-3 border-t border-gray-200">
              <div className="px-4 mb-3">
                <LanguageSelector />
              </div>
              
              {!isAuthenticated ? (
                <div className="flex flex-col space-y-2 px-4">
                  <Link to="/login" className="w-full px-4 py-2 text-center text-[#0C2D83] border border-[#0C2D83] rounded-md" onClick={() => setIsMenuOpen(false)}>
                    {t('auth.login', 'Login')}
                  </Link>
                  <Link to="/register" className="w-full px-4 py-2 text-center bg-[#0C2D83] text-white rounded-md" onClick={() => setIsMenuOpen(false)}>
                    {t('auth.register', 'Register')}
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 px-4">
                  <Link to="/profile" className="w-full px-4 py-2 text-center text-gray-700 border border-gray-300 rounded-md" onClick={() => setIsMenuOpen(false)}>
                    {t('auth.profile', 'Profile')}
                  </Link>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full px-4 py-2 text-center bg-gray-100 text-gray-700 rounded-md">
                    {t('auth.logout', 'Logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom green stripe */}
      <div className="h-1.5 bg-[#138808]"></div>
    </header>
  );
}

export default Navbar; 