import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Create axios instance with credentials
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000
});

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Only attempt refresh if:
    // 1. We got a 401 error
    // 2. We haven't already retried this request
    // 3. The request was NOT to /api/auth/me (which is expected to fail when no session)
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url.includes('/api/auth/me')) {
      
      originalRequest._retry = true;
      
      try {
        await api.post('/api/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [selections, setSelections] = useState({
    data: {
      language: '',
      uiTesting: '',
      testFramework: '',
      bddFramework: '',
      mobileTesting: '',
      buildTool: '',
      apiTesting: '',
      database: '',
      cicd: '',
      testManagement: ''
    },
    version: 1
  });
  const [progress, setProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced save functions
  const debouncedSaveSelections = useCallback(
    debounce(async (newSelectionsData) => {
      try {
        // Double-check authentication before making the request
        if (!user || !user.id) {
          console.log('Skipping save - no authenticated user');
          return;
        }
        
        await api.put('/api/user/selections', newSelectionsData);
        console.log('Selections saved successfully');
      } catch (error) {
        console.error('Failed to save selections:', error);
        if (error.response?.status === 409) {
          // Version conflict - fetch latest, but don't overwrite if user just made a change
          try {
            const latestResponse = await api.get('/api/user/selections');
            const latestData = latestResponse.data;
            // Server returns { data: {...}, version: X }
            if (latestData && latestData.data) {
              console.log('Version conflict resolved, fetched latest selections:', latestData);
              console.log('Attempting to save with latest version...');
              // Try to save again with the latest version, merging our changes
              const updatedData = {
                data: { ...latestData.data, ...newSelectionsData.data },
                version: latestData.version
              };
              await api.put('/api/user/selections', updatedData);
              setSelections(updatedData);
              console.log('Selections saved successfully after conflict resolution');
            }
          } catch (fetchError) {
            console.error('Failed to resolve version conflict:', fetchError);
          }
        } else if (error.response?.status === 401) {
          // User not authenticated - this shouldn't happen with our check above
          console.log('Unauthorized - user may have logged out');
        }
      }
    }, 1000),
    [user]
  );

  const debouncedSaveProgress = useCallback(
    debounce(async (tutorialId, progressData) => {
      try {
        await api.put(`/user/progress/${tutorialId}`, progressData);
      } catch (error) {
        console.error('Failed to save progress:', error);
        if (error.response?.status === 409) {
          // Version conflict - fetch latest
          const latest = await api.get(`/user/progress/${tutorialId}`);
          setProgress(prev => ({
            ...prev,
            [tutorialId]: latest.data
          }));
        }
      }
    }, 1000),
    []
  );

  // Initialize user session on app load
  useEffect(() => {
    const initializeSession = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/auth/me');
        const { user: userData } = response.data;
        const { profile, selections: selectionsData, progressSummary } = userData || {};
        
        setUser(userData);
        setUserProfile(profile);
        
        console.log('Session init - received selections data:', selectionsData);
        
        if (selectionsData && selectionsData.data && Object.keys(selectionsData.data).some(key => selectionsData.data[key] && selectionsData.data[key] !== '')) {
          console.log('Session init - found selections on server, using them');
          setSelections(selectionsData);
        } else {
          console.log('Session init - no valid selections data, using defaults');
        }
        
        // Convert progress summary to progress state
        const progressState = {};
        if (progressSummary && Array.isArray(progressSummary)) {
          progressSummary.forEach(item => {
            progressState[item._id] = {
              status: item.status,
              percent: item.percent,
              lastUpdated: item.lastUpdated
            };
          });
        }
        setProgress(progressState);
        
      } catch (error) {
        // 401 is expected when no user is logged in - don't log as error
        if (error.response?.status !== 401) {
          console.error('Session initialization error:', error);
        }
        setUser(null);
        setUserProfile(null);
        setSelections({
          data: {
            language: '',
            uiTesting: '',
            testFramework: '',
            bddFramework: '',
            mobileTesting: '',
            buildTool: '',
            apiTesting: '',
            database: '',
            cicd: '',
            testManagement: ''
          },
          version: 1
        });
        setProgress({});
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { user: userData, profile } = response.data;
      
      setUser(userData);
      setUserProfile(profile);
      
      // Fetch user data
      const meResponse = await api.get('/api/auth/me');
      const { user: userDataFromMe } = meResponse.data;
      const { selections: selectionsData, progressSummary } = userDataFromMe || {};
      
      console.log('Login - received full user data:', userDataFromMe);
      console.log('Login - received selections data from server:', selectionsData);
      
      if (selectionsData && selectionsData.data && Object.keys(selectionsData.data).some(key => selectionsData.data[key] && selectionsData.data[key] !== '')) {
        console.log('Login - found selections on server, using them');
        setSelections(selectionsData);
      } else {
        console.log('Login - no valid selections data from server, keeping current local selections');
        
        // If we have local selections, save them to server
        const localSelections = selections;
        if (localSelections && localSelections.data && Object.keys(localSelections.data).some(key => localSelections.data[key] && localSelections.data[key] !== '')) {
          console.log('Login - found local selections, saving them to server');
          // Force immediate save of current selections
          setTimeout(() => {
            if (userDataFromMe && userDataFromMe.id) {
              api.put('/api/user/selections', localSelections).then(() => {
                console.log('Local selections saved to server');
              }).catch(err => {
                console.error('Failed to save local selections:', err);
              });
            }
          }, 100);
        }
      }
      
      const progressState = {};
      if (progressSummary && Array.isArray(progressSummary)) {
        progressSummary.forEach(item => {
          progressState[item._id] = {
            status: item.status,
            percent: item.percent,
            lastUpdated: item.lastUpdated
          };
        });
      }
      setProgress(progressState);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      const { user: userData } = response.data;
      
      setUser(userData);
      
      // Auto-login after registration
      return await login(email, password);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setUserProfile(null);
      setSelections({
        data: {
          language: '',
          uiTesting: '',
          testFramework: '',
          bddFramework: '',
          mobileTesting: '',
          buildTool: '',
          apiTesting: '',
          database: '',
          cicd: '',
          testManagement: ''
        },
        version: 1
      });
      setProgress({});
      setError(null);
    }
  };

  // Update selections with optimistic concurrency
  const updateSelections = (newSelections) => {
    // Increment version for this update
    const newVersion = selections.version + 1;
    const updatedSelections = {
      data: { ...selections.data, ...newSelections },
      version: newVersion
    };
    
    setSelections(updatedSelections);
    
    // Only save to server if user is authenticated
    if (user && user.id) {
      debouncedSaveSelections(updatedSelections);
    }
  };

  // Update progress with optimistic concurrency
  const updateProgress = (tutorialId, sectionId, progressData) => {
    const currentProgress = progress[tutorialId] || { version: 1 };
    const updatedProgress = {
      tutorialId,
      sectionId,
      ...progressData,
      version: currentProgress.version
    };
    
    setProgress(prev => ({
      ...prev,
      [tutorialId]: updatedProgress
    }));
    
    debouncedSaveProgress(tutorialId, updatedProgress);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/api/user/profile', profileData);
      setUserProfile(response.data.profile);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Save notes
  const saveNote = async (tutorialId, content) => {
    try {
      const response = await api.post('/api/user/notes', { tutorialId, content });
      return { success: true, note: response.data.note };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to save note';
      return { success: false, error: errorMessage };
    }
  };

  // Get notes
  const getNotes = async (tutorialId) => {
    try {
      const response = await api.get(`/user/notes?tutorialId=${tutorialId}`);
      return { success: true, notes: response.data.notes };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to get notes';
      return { success: false, error: errorMessage };
    }
  };

  // Legacy compatibility functions
  const updateSelectedTech = (selectedTech) => {
    updateSelections(selectedTech);
  };

  const updateCharactersPosition = (position) => {
    // This is now handled client-side only since it's UI state
    // Could be saved to user preferences if needed
    console.log('Character position updated:', position);
  };

  const updateCurrentStep = (step) => {
    // This is now handled client-side only since it's UI state
    console.log('Current step updated:', step);
  };

  const value = {
    // User state
    user,
    userProfile,
    selections,
    progress,
    isLoading,
    error,
    
    // Auth functions
    login,
    register,
    logout,
    
    // Data functions
    updateSelections,
    updateProgress,
    updateProfile,
    saveNote,
    getNotes,
    
    // Legacy compatibility
    updateSelectedTech,
    updateCharactersPosition,
    updateCurrentStep,
    
    // Utility
    clearError: () => setError(null)
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
