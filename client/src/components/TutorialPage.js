import React from 'react';
import { ArrowLeft, BookOpen, Play, CheckCircle, Lock } from 'lucide-react';
import { getTechIcon, getCategoryIcon } from '../utils/techIcons';

const TutorialPage = ({ onBackToBuilder, selectedTech, getStepOptions, user }) => {
  const handleBackToMain = () => {
    if (onBackToBuilder) {
      onBackToBuilder();
    } else {
      // Fallback navigation if no callback provided
      window.location.href = '/';
    }
  };

  // Get technology labels for display
  const getTechLabel = (stepId, value) => {
    if (!value) return null;
    const options = getStepOptions ? getStepOptions(stepId) : [];
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // Get technology icons using the techIcons utility
  const getTechIconPath = (stepId, value) => {
    if (!value) return null;
    return getTechIcon(value);
  };

  // Get step titles
  const getStepTitle = (stepId) => {
    const titles = {
      language: 'Language',
      uiTesting: 'UI Testing',
      testFramework: 'Test Framework',
      bddFramework: 'BDD Framework',
      mobileTesting: 'Mobile Testing',
      buildTool: 'Build Tool',
      apiTesting: 'API Testing',
      database: 'Database',
      cicd: 'CI/CD',
      testManagement: 'Test Management'
    };
    return titles[stepId] || stepId;
  };

  // Filter out empty selections and create tech list
  const selectedTechnologies = Object.entries(selectedTech || {})
    .filter(([key, value]) => value && value !== '' && value !== null && value !== undefined)
    .flatMap(([stepId, value]) => {
      // Handle arrays (e.g., versionControl)
      const values = Array.isArray(value) ? value : [value];
      return values.map((singleValue, idx) => ({
        stepId,
        value: singleValue,
        label: getTechLabel(stepId, singleValue),
        iconPath: getTechIconPath(stepId, singleValue),
        title: getStepTitle(stepId)
      }));
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Learning Path</h1>
        </div>

        <div className="card fade-in">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to Your Learning Journey!</h2>
          <p className="text-white/70 mb-6">
            Based on your technology selections, here's your personalized learning path.
          </p>
          
          {/* Selected Technologies - Brief List */}
          {selectedTechnologies.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Your Technology Stack</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTechnologies.map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                  >
                    {tech.iconPath && (
                      <img 
                        src={tech.iconPath} 
                        alt={`${tech.label} icon`}
                        className="w-4 h-4 mr-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <span className="ml-2 font-medium">{tech.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-white/20 bg-white/10">
              <h3 className="text-white font-semibold mb-2">Step 1: Environment Setup</h3>
              <p className="text-white/70 text-sm">Set up your development environment</p>
            </div>
            
            <div className="p-4 rounded-xl border border-white/20 bg-white/10">
              <h3 className="text-white font-semibold mb-2">Step 2: Basic Concepts</h3>
              <p className="text-white/70 text-sm">Learn the fundamentals</p>
            </div>
            
            <div className="p-4 rounded-xl border border-white/20 bg-white/10">
              <h3 className="text-white font-semibold mb-2">Step 3: Hands-on Practice</h3>
              <p className="text-white/70 text-sm">Build real projects</p>
            </div>

            {/* SQL Lab entry point */}
            <div className="p-4 rounded-xl border border-white/20 bg-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">Practice SQL (in-browser)</h3>
                    {!user && <Lock className="w-4 h-4 text-yellow-400" />}
                  </div>
                  <p className="text-white/70 text-sm">
                    Run queries against a seeded dataset without installing Postgres.
                    {!user && <span className="text-yellow-400 block mt-1">⚠️ Login required to access SQL Lab</span>}
                  </p>
                </div>
                <button
                  className="btn-primary flex items-center gap-2"
                  onClick={() => {
                    if (window && typeof window.onNavigateToSql === 'function') {
                      window.onNavigateToSql();
                    }
                  }}
                >
                  {!user && <Lock className="w-4 h-4" />}
                  Open SQL Lab
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;