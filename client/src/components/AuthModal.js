import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [authMode, setAuthMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register, isLoading: contextLoading, error: contextError, clearError } = useUser();

  // Update authMode when initialMode prop changes
  useEffect(() => {
    setAuthMode(initialMode);
  }, [initialMode]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (authMode === 'login') {
        if (!formData.email || !formData.password) {
          throw new Error('Please fill in all fields');
        }
        
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          onClose();
        } else {
          setError(result.error);
        }
      } else {
        // Normalize inputs
        const name = (formData.name || '').trim();
        const email = (formData.email || '').trim();
        const password = formData.password || '';
        const confirmPassword = formData.confirmPassword || '';

        if (!name || !email || !password || !confirmPassword) {
          throw new Error('Please fill in all fields');
        }

        // Basic email sanity check
        const emailRegex = /.+@.+\..+/;
        if (!emailRegex.test(email)) {
          throw new Error('Please enter a valid email address');
        }

        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        
        // Password strength (correct full-string check)
        const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]|;:'",.<>/?]).{8,}$/;
        if (!strongPassword.test(password)) {
          throw new Error('Password must include upper & lower case letters, a number, and a special character');
        }

        const result = await register(name, email, password);
        
        if (result.success) {
          onClose();
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
    clearError();
  };

  if (!isOpen) return null;

  const currentError = error || contextError;
  const currentLoading = isLoading || contextLoading;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="p-8 pb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {authMode === 'login' ? 'Welcome Back' : 'Join QA Tech Builder'}
              </h2>
              <p className="text-gray-600">
                {authMode === 'login' 
                  ? 'Sign in to continue building your personalized QA testing stack' 
                  : 'Create your account and start building your perfect QA testing technology stack'
                }
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8">
            {authMode === 'register' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {authMode === 'register' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            {currentError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{currentError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={currentLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {authMode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                authMode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="px-8 pb-8 text-center">
            <p className="text-gray-600">
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={switchMode}
                className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2"
              >
                {authMode === 'login' ? 'Create one here' : 'Sign in here'}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
