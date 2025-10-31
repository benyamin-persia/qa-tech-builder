import React, { useState, useEffect, useCallback } from 'react';
// Router is provided at index.js; avoid nested routers
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  Sparkles,
  Code,
  Layers,
  Zap,
  Smartphone,
  Settings,
  Cpu,
  Database,
  GitBranch,
  CheckCircle,
  GitCommit
} from 'lucide-react';
import { UserProvider, useUser } from './contexts/UserContext';
import TechSelector from './components/TechSelector';
import TechStackPreview from './components/TechStackPreview';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import TutorialPage from './components/TutorialPage';
import AuthModal from './components/AuthModal';
import { AnimatedCharacters } from './components/ui/animated-characters';

// Import the 21st.dev toolbar React components (optional)
// import { TwentyFirstToolbar } from '@21st-extension/toolbar-react';
// import { ReactPlugin } from '@21st-extension/react';

const AppContent = () => {
  const { user, selections, updateSelections, isLoading } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [isValid, setIsValid] = useState(false);
  // Initialize currentPage from localStorage or default to 'builder' if selections exist
  const [currentPage, setCurrentPage] = useState(() => {
    const storedPage = localStorage.getItem('currentPage');
    return storedPage || 'landing';
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // Track which mode to show
  const [stepInitialized, setStepInitialized] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null); // Track where to redirect after login
  const [sqlProgress, setSqlProgress] = useState({ completed: 0, total: 14, percent: 0 });
  const [showTetris, setShowTetris] = useState(false);

  const handleSqlProgress = useCallback((completed, total, percent) => {
    setSqlProgress({ completed, total, percent });
  }, []);

  // Save currentPage to localStorage whenever it changes
  useEffect(() => {
    if (currentPage) {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage]);

  // Auto-switch to builder if user has selections
  useEffect(() => {
    if (selections && selections.data && Object.keys(selections.data).length > 0) {
      const hasSelections = Object.keys(selections.data).some(key => selections.data[key] && selections.data[key] !== '');
      if (hasSelections && currentPage === 'landing') {
        console.log('User has selections, switching to builder page');
        setCurrentPage('builder');
      }
    }
  }, [selections, currentPage]);

  // Handle redirect after successful login
  useEffect(() => {
    if (user && redirectAfterLogin && !showAuthModal) {
      // User just logged in and there's a pending redirect
      console.log('Redirecting to:', redirectAfterLogin);
      setCurrentPage(redirectAfterLogin);
      setRedirectAfterLogin(null); // Clear the redirect
    }
  }, [user, redirectAfterLogin, showAuthModal]);

  // Note: This useEffect will be moved after steps is defined

  // Update validation based on selections
  useEffect(() => {
    if (selections && selections.data) {
      const requiredFields = ['language', 'uiTesting', 'testFramework', 'buildTool', 'apiTesting', 'database', 'cicd', 'versionControl', 'testManagement'];
      const hasAllRequired = requiredFields.every(field => {
        const value = selections.data[field];
        // For versionControl (array), check if it has at least one item
        if (field === 'versionControl') {
          return Array.isArray(value) && value.length > 0;
        }
        return value;
      });
      setIsValid(hasAllRequired);
    }
  }, [selections]);

  // Initialize 21st.dev toolbar
  // useEffect(() => {
  //   const setupToolbar = () => {
  //     // Only initialize once and only in development mode
  //     if (process.env.NODE_ENV === 'development') {
  //       const toolbarConfig = {
  //         plugins: [ReactPlugin],
  //         projectName: 'QA Tech Builder',
  //         description: 'QA Testing Technology Stack Builder'
  //       };
  //       
  //       try {
  //         console.log('🚀 21st.dev toolbar will be initialized by React component!');
  //       } catch (error) {
  //         console.warn('⚠️ Failed to initialize 21st.dev toolbar:', error);
  //       }
  //     }
  //   };

  //   setupToolbar();
  // }, []);

  const steps = [
    {
      id: 'language',
      title: 'Choose Programming Language',
      description: 'Select your preferred programming language',
      icon: <Code className="w-6 h-6" />,
      options: [
        { value: 'java', label: 'Java', description: 'Enterprise-grade automation' },
        { value: 'python', label: 'Python', description: 'Simple and powerful' },
        { value: 'javascript', label: 'JavaScript', description: 'Modern web development' }
      ]
    },
    {
      id: 'uiTesting',
      title: 'UI Testing Framework',
      description: 'Choose your UI testing tool',
      icon: <Layers className="w-6 h-6" />,
      options: []
    },
    {
      id: 'testFramework',
      title: 'Test Framework',
      description: 'Select your test framework',
      icon: <Zap className="w-6 h-6" />,
      options: []
    },
    {
      id: 'bddFramework',
      title: 'BDD Framework',
      description: 'Choose your BDD testing framework',
      icon: <Sparkles className="w-6 h-6" />,
      options: []
    },
    {
      id: 'mobileTesting',
      title: 'Mobile Testing',
      description: 'Choose your mobile testing framework',
      icon: <Smartphone className="w-6 h-6" />,
      options: []
    },
    {
      id: 'buildTool',
      title: 'Build Tool',
      description: 'Choose your build tool',
      icon: <Settings className="w-6 h-6" />,
      options: []
    },
    {
      id: 'apiTesting',
      title: 'API Testing',
      description: 'Select API testing tool',
      icon: <Cpu className="w-6 h-6" />,
      options: []
    },
    {
      id: 'database',
      title: 'Database',
      description: 'Choose your database',
      icon: <Database className="w-6 h-6" />,
      options: []
    },
    {
      id: 'cicd',
      title: 'CI/CD Pipeline',
      description: 'Select CI/CD tool',
      icon: <GitBranch className="w-6 h-6" />,
      options: []
    },
    {
      id: 'versionControl',
      title: 'Version Control',
      description: 'Choose your version control platform',
      icon: <GitCommit className="w-6 h-6" />,
      options: []
    },
    {
      id: 'testManagement',
      title: 'Test Management',
      description: 'Choose test management tool',
      icon: <CheckCircle className="w-6 h-6" />,
      options: []
    }
  ];

  // Get options for a specific step based on current selections
  const getStepOptions = (stepId) => {
    const { language } = selections.data;
    
    switch (stepId) {
      case 'language':
        return [
          { value: 'java', label: 'Java', description: 'Enterprise-grade automation', popularity: 45 },
          { value: 'python', label: 'Python', description: 'Simple and powerful', popularity: 35 },
          { value: 'javascript', label: 'JavaScript', description: 'Modern web development', popularity: 20 }
        ];
      
      case 'uiTesting':
        if (language === 'java') {
          return [
            { value: 'selenium', label: 'Selenium', description: 'Industry standard', popularity: 70 },
            { value: 'playwright', label: 'Playwright', description: 'Modern automation', popularity: 30 }
          ];
        } else if (language === 'python') {
          return [
            { value: 'selenium', label: 'Selenium', description: 'Web automation', popularity: 65 },
            { value: 'playwright', label: 'Playwright', description: 'Modern automation', popularity: 35 }
          ];
        } else if (language === 'javascript') {
          return [
            { value: 'playwright', label: 'Playwright', description: 'Modern automation', popularity: 55 },
            { value: 'cypress', label: 'Cypress', description: 'End-to-end testing', popularity: 45 }
          ];
        }
        return [];
      
      case 'testFramework':
        if (language === 'java') {
          return [
            { value: 'testng', label: 'TestNG', description: 'Prerequisites: Java → Mature JVM test runner with parallelism', popularity: 60 },
            { value: 'junit', label: 'JUnit', description: 'Prerequisites: Java → Industry standard, modular architecture', popularity: 40 }
          ];
        } else if (language === 'python') {
          return [
            { value: 'pytest', label: 'pytest', description: 'Prerequisites: Python → Fast with fixtures and parametrization', popularity: 75 },
            { value: 'unittest', label: 'unittest', description: 'Prerequisites: Python → Built-in and stable, simple structure', popularity: 25 }
          ];
        } else if (language === 'javascript') {
          return [
            { value: 'jest', label: 'Jest', description: 'Prerequisites: JavaScript → Fast with snapshots, great DX', popularity: 80 },
            { value: 'mocha', label: 'Mocha', description: 'Prerequisites: JavaScript → Flexible with custom reporters', popularity: 20 }
          ];
        }
        return [];
      
      case 'bddFramework':
        if (language === 'java') {
          return [
            { value: 'cucumber', label: 'Cucumber', description: 'Learn: Gherkin + Java → Business-readable specs on JVM', popularity: 100 }
          ];
        } else if (language === 'python') {
          return [
            { value: 'behave', label: 'Behave', description: 'Learn: Gherkin + Python → Clean BDD in Python', popularity: 70 },
            { value: 'pytest-bdd', label: 'pytest-bdd', description: 'Learn: Gherkin + Python → BDD with pytest fixtures', popularity: 30 }
          ];
        } else if (language === 'javascript') {
          return [
            { value: 'cucumber-js', label: 'Cucumber.js', description: 'Learn: Gherkin + JavaScript → BDD in Node/JS projects', popularity: 100 }
          ];
        }
        return [];
      
      case 'mobileTesting':
        if (language === 'java') {
          return [
            { value: 'appium', label: 'Appium', description: 'Cross-platform mobile automation', popularity: 80 },
            { value: 'espresso', label: 'Espresso', description: 'Android native testing', popularity: 20 }
          ];
        } else if (language === 'python') {
          return [
            { value: 'appium', label: 'Appium', description: 'Cross-platform mobile automation', popularity: 90 },
            { value: 'maestro', label: 'Maestro', description: 'Modern mobile testing', popularity: 10 }
          ];
        } else if (language === 'javascript') {
          return [
            { value: 'appium', label: 'Appium', description: 'Cross-platform mobile automation', popularity: 60 },
            { value: 'detox', label: 'Detox', description: 'React Native testing', popularity: 25 },
            { value: 'maestro', label: 'Maestro', description: 'Modern mobile testing', popularity: 15 }
          ];
        }
        return [];
      
      case 'buildTool':
        if (language === 'java') {
          return [
            { value: 'maven', label: 'Maven', description: 'XML configuration, enterprise-friendly', popularity: 65 },
            { value: 'gradle', label: 'Gradle', description: 'Flexible Groovy/Kotlin DSL, faster builds', popularity: 35 }
          ];
        } else if (language === 'python') {
          return [
            { value: 'pip', label: 'pip', description: 'Built-in package installer for Python', popularity: 75 },
            { value: 'poetry', label: 'Poetry', description: 'Modern dependency management with TOML', popularity: 25 }
          ];
        } else if (language === 'javascript') {
          return [
            { value: 'npm', label: 'npm', description: 'Default Node.js package manager', popularity: 70 },
            { value: 'yarn', label: 'Yarn', description: 'Fast installs with workspaces support', popularity: 30 }
          ];
        }
        return [];
      
      case 'apiTesting':
        if (language === 'java') {
          return [
            { value: 'rest-assured', label: 'REST Assured', description: 'Code-first API tests with fluent DSL', popularity: 60 },
            { value: 'karate', label: 'Karate', description: 'API+UI+performance in one framework', popularity: 40 }
          ];
        } else if (language === 'python') {
          return [
            { value: 'requests', label: 'requests', description: 'Simple HTTP library for API testing', popularity: 80 },
            { value: 'pytest-requests', label: 'pytest-requests', description: 'API testing with pytest fixtures', popularity: 20 }
          ];
        } else if (language === 'javascript') {
          return [
            { value: 'supertest', label: 'Supertest', description: 'Great for Node/Express services', popularity: 55 },
            { value: 'axios', label: 'Axios', description: 'Simple HTTP client for test harnesses', popularity: 45 }
          ];
        }
        return [];
      
      case 'database':
        return [
          { value: 'postgresql', label: 'PostgreSQL', description: 'Prerequisites: Learn SQL → Powerful SQL with JSONB, analytics extensions', popularity: 30 },
          { value: 'mysql', label: 'MySQL', description: 'Prerequisites: Learn SQL → Ubiquitous and easy to manage', popularity: 25 },
          { value: 'mongodb', label: 'MongoDB', description: 'Prerequisites: Learn JSON & MQL → Flexible document store for rapid prototyping', popularity: 20 },
          { value: 'oracle', label: 'Oracle', description: 'Prerequisites: Learn SQL & PL/SQL → Enterprise features and tooling', popularity: 15 },
          { value: 'sqlite', label: 'SQLite', description: 'Prerequisites: Learn SQL → Zero-config, file-based DB for tests', popularity: 10 }
        ];
      
      case 'cicd':
        return [
          { value: 'jenkins', label: 'Jenkins', description: 'Prerequisites: Groovy → Self-hosted with rich plugin ecosystem', popularity: 50 },
          { value: 'github-actions', label: 'GitHub Actions', description: 'Prerequisites: YAML → Repo-native CI/CD with marketplace', popularity: 35 },
          { value: 'circleci', label: 'CircleCI', description: 'Prerequisites: YAML → Simple config with strong insights', popularity: 15 }
        ];
      
      case 'versionControl':
        return [
          { value: 'git', label: 'Git', description: 'Prerequisites: CLI → The de-facto distributed VCS', popularity: 40 },
          { value: 'github', label: 'GitHub', description: 'Prerequisites: Git → Largest ecosystem, PRs, Actions CI', popularity: 35 },
          { value: 'gitlab', label: 'GitLab', description: 'Prerequisites: Git → All-in-one DevOps with built-in CI', popularity: 15 },
          { value: 'bitbucket', label: 'Bitbucket', description: 'Prerequisites: Git → Atlassian integration, lightweight', popularity: 10 }
        ];
      
      case 'testManagement':
        return [
          { value: 'jira', label: 'Jira', description: 'Ubiquitous project tracking with issue workflows', popularity: 60 },
          { value: 'testrail', label: 'TestRail', description: 'Clean test runs and flexible reports', popularity: 30 },
          { value: 'xray', label: 'Xray', description: 'Embed BDD and test cases in Jira', popularity: 10 }
        ];
      
      default:
        return [];
    }
  };

  const handleTechSelect = (stepId, value) => {
    const newSelections = { ...selections.data };
    
    // If language is changed, reset all subsequent selections
    if (stepId === 'language') {
      const resetSelections = {
        language: value,
        uiTesting: '',
        testFramework: '',
        bddFramework: '',
        mobileTesting: '',
        buildTool: '',
        apiTesting: '',
        database: '',
        cicd: '',
        versionControl: [],
        testManagement: ''
      };
      updateSelections(resetSelections);
      setCurrentStep(1);
    } else if (stepId === 'versionControl') {
      // Handle multi-select for version control - combine selections into one card
      const currentValues = Array.isArray(newSelections[stepId]) ? [...newSelections[stepId]] : [];
      const index = currentValues.indexOf(value);
      if (index > -1) {
        currentValues.splice(index, 1); // Remove if already selected
      } else {
        currentValues.push(value); // Add if not selected
      }
      newSelections[stepId] = currentValues;
      updateSelections(newSelections);
      // Don't auto-advance for multi-select, let user manually proceed
    } else {
      newSelections[stepId] = value;
      updateSelections(newSelections);
      
      // Auto-advance to next step
      const stepIndex = steps.findIndex(step => step.id === stepId);
      if (stepIndex < steps.length - 1) {
        setCurrentStep(stepIndex + 1);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCombination = async () => {
    // Validation is now handled automatically by the useEffect
    // No need for manual validation
  };

  const startBuilding = () => {
    setCurrentPage('builder');
  };

  // Initialize from user selections once
  useEffect(() => {
    if (!stepInitialized && selections && selections.data && Object.keys(selections.data).length > 0) {
      // Check if we have any selections to determine current step
      const selectedKeys = Object.keys(selections.data).filter(key => selections.data[key] && selections.data[key] !== '');
      if (selectedKeys.length > 0) {
        // Set current step to the next unselected step, or last step if all are selected
        const nextIndex = Math.min(selectedKeys.length, steps.length - 1);
        console.log('Setting current step to:', nextIndex, 'based on selections:', selectedKeys);
        setCurrentStep(nextIndex);
        setStepInitialized(true);
      }
    }
  }, [selections, steps.length, stepInitialized]);

  const goToTutorial = useCallback(() => {
    setCurrentPage('tutorial');
    // Don't use window.location.href as it causes a full page reload and resets state
  }, []);

  const backToBuilder = useCallback(() => {
    setCurrentPage('builder');
    // Don't use window.location.href as it causes a full page reload and resets state
  }, []);

  // Set up global navigation function
  React.useEffect(() => {
    window.onNavigateToTutorial = () => {
      goToTutorial();
    };
    window.onNavigateToSql = () => {
      if (!user) {
        // Show login modal if user is not logged in
        setAuthMode('login');
        setRedirectAfterLogin('sql'); // Remember where to redirect after login
        setShowAuthModal(true);
      } else {
        setCurrentPage('sql');
      }
    };
    window.onNavigateBackToTutorial = () => {
      setCurrentPage('tutorial');
    };
    return () => {
      delete window.onNavigateToTutorial;
      delete window.onNavigateToSql;
      delete window.onNavigateBackToTutorial;
    };
  }, [goToTutorial, user]);

  // Render based on current page state (preserves user selections)
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="fixed inset-0 pointer-events-none z-50">
          <AnimatedCharacters className="w-full h-full" />
        </div>
        <Header 
          onShowAuth={() => {
            setAuthMode('login');
            setShowAuthModal(true);
          }}
          currentPage={currentPage}
        />
        <LandingPage onStartBuilding={() => setCurrentPage('builder')} />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </div>
    );
  }
  if (currentPage === 'tutorial') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="fixed inset-0 pointer-events-none z-50">
          <AnimatedCharacters className="w-full h-full" />
        </div>
        <Header 
          onShowAuth={() => {
            setAuthMode('login');
            setShowAuthModal(true);
          }}
          currentPage={currentPage}
        />
        <TutorialPage onBackToBuilder={backToBuilder} selectedTech={selections.data} getStepOptions={getStepOptions} user={user} />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </div>
    );
  }

  if (currentPage === 'sql') {
    const SqlPlaygroundQA = require('./components/SqlPlaygroundQA').default;
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="fixed inset-0 pointer-events-none z-50">
          <AnimatedCharacters className="w-full h-full" />
        </div>
        <Header 
          onShowAuth={() => {
            setAuthMode('login');
            setShowAuthModal(true);
          }}
          showTetris={showTetris}
          onToggleTetris={() => setShowTetris(!showTetris)}
          currentPage={currentPage}
          onBackToTutorial={() => setCurrentPage('tutorial')}
        />
        <main className="container mx-auto px-4 py-4 relative" style={{ height: 'calc(100vh - 8rem)', display: 'flex', flexDirection: 'column' }}>
          <div className="mb-2 relative z-20">
            <h1 className="text-2xl font-bold text-white">SQL for QA Testers Lab</h1>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <SqlPlaygroundQA onProgressUpdate={handleSqlProgress} showTetris={showTetris} />
          </div>
        </main>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </div>
    );
  }

  // Ensure the step index is always safe for rendering
  const safeStepIndex = Math.min(Math.max(currentStep, 0), Math.max(steps.length - 1, 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated Characters - Full Screen */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatedCharacters className="w-full h-full" />
      </div>
      
      {/* 21st.dev Toolbar - Only in development mode */}
      {/* {process.env.NODE_ENV === 'development' && (
        <TwentyFirstToolbar 
          config={{
            plugins: [ReactPlugin],
            projectName: 'QA Tech Builder',
            description: 'QA Testing Technology Stack Builder'
          }}
        />
      )} */}
      
      <Header 
        onShowAuth={() => {
          setAuthMode('login');
          setShowAuthModal(true);
        }}
        currentPage={currentPage}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Tech Selector */}
          <div>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <TechSelector
                step={{
                  ...steps[safeStepIndex],
                  options: getStepOptions(steps[safeStepIndex].id)
                }}
                selectedValue={selections.data[steps[safeStepIndex].id]}
                onSelect={(value) => handleTechSelect(steps[safeStepIndex].id, value)}
                onNext={nextStep}
                onPrev={prevStep}
                isFirstStep={safeStepIndex === 0}
                isLastStep={safeStepIndex === steps.length - 1}
                canProceed={
                  steps[safeStepIndex].id === 'versionControl'
                    ? Array.isArray(selections.data[steps[safeStepIndex].id]) && selections.data[steps[safeStepIndex].id].length > 0
                    : selections.data[steps[safeStepIndex].id] !== ''
                }
                onNavigateToTutorial={goToTutorial}
                currentStep={safeStepIndex}
                totalSteps={steps.length}
              />
            </motion.div>
          </div>

          {/* Tech Stack Preview */}
          <div>
            <TechStackPreview
                selectedTech={selections.data}
              getStepOptions={getStepOptions}
            />
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
};

// Main App component with UserProvider
const App = () => {
  try {
    return (
      <UserProvider>
        <AppContent />
      </UserProvider>
    );
  } catch (error) {
    console.error('Error in App component:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-white text-4xl text-center">QA Tech Builder</h1>
          <p className="text-white/70 text-center mt-4">Error loading application. Please refresh the page.</p>
          <p className="text-red-400 text-center mt-2 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }
};

export default App;
