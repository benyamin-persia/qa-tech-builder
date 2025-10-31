import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Github, Twitter, Linkedin, LogOut } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const Header = ({ onShowAuth, showTetris, onToggleTetris, onBackToTutorial, currentPage }) => {
  const { user, logout } = useUser();
  return (
    <header className="py-3">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white"><a href="/">QA Tech Builder</a></h1>
              <p className="text-white/70 text-sm">Build your perfect testing stack</p>
            </div>
            {/* Back to Tutorial Button - only on SQL page */}
            {currentPage === 'sql' && (
              <button 
                className="btn-secondary ml-8" 
                onClick={() => {
                  if (onBackToTutorial) {
                    onBackToTutorial();
                  } else if (window.onNavigateBackToTutorial) {
                    window.onNavigateBackToTutorial();
                  }
                }}
              >
                Back to Tutorial
              </button>
            )}
            {/* Back to Main Page Button - only on Tutorial page */}
            {currentPage === 'tutorial' && (
              <button 
                className="btn-secondary ml-8" 
                onClick={() => {
                  if (onBackToTutorial) {
                    onBackToTutorial();
                  }
                }}
              >
                Back to Main Page
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-white/70 hover:text-white transition-colors">Builder</a>
            {onToggleTetris ? (
              <button 
                onClick={onToggleTetris}
                className={`transition-colors ${
                  showTetris 
                    ? 'text-white font-semibold' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Game
              </button>
            ) : (
              <a href="/tutorial" className="text-white/70 hover:text-white transition-colors">Tutorial</a>
            )}
            {user ? (
              <>
                <div className="flex items-center space-x-3">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-white/70">Hi, {user.name || user.email}</span>
                  <button 
                    onClick={logout} 
                    className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={() => onShowAuth && onShowAuth('login')} 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Login
              </button>
            )}
          </nav>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com"
              className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Github className="w-5 h-5 text-white" />
            </a>
            <a
              href="https://twitter.com"
              className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Twitter className="w-5 h-5 text-white" />
            </a>
            <a
              href="https://linkedin.com"
              className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Linkedin className="w-5 h-5 text-white" />
            </a>
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
