import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Loader, 
  Code, 
  Layers, 
  Zap, 
  Settings, 
  Cpu, 
  Database, 
  GitBranch, 
  CheckSquare,
  Sparkles,
  Smartphone
} from 'lucide-react';

const CombinationPreview = ({ selectedTech, isValid, isLoading, onValidate, getStepOptions }) => {
  const techIcons = {
    language: <Code className="w-5 h-5" />,
    uiTesting: <Layers className="w-5 h-5" />,
    testFramework: <Zap className="w-5 h-5" />,
    bddFramework: <Sparkles className="w-5 h-5" />,
    mobileTesting: <Smartphone className="w-5 h-5" />,
    buildTool: <Settings className="w-5 h-5" />,
    apiTesting: <Cpu className="w-5 h-5" />,
    database: <Database className="w-5 h-5" />,
    cicd: <GitBranch className="w-5 h-5" />,
    testManagement: <CheckSquare className="w-5 h-5" />
  };

  const techLabels = {
    language: 'Programming Language',
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

  const selectedCount = Object.values(selectedTech).filter(value => value !== '').length;
  const totalSteps = Object.keys(selectedTech).length;

  const getTechDisplayName = (key, value) => {
    const displayNames = {
      java: 'Java',
      python: 'Python',
      javascript: 'JavaScript',
      selenium: 'Selenium',
      playwright: 'Playwright',
      cypress: 'Cypress',
      testng: 'TestNG',
      junit: 'JUnit',
      pytest: 'pytest',
      unittest: 'unittest',
      jest: 'Jest',
      mocha: 'Mocha',
      cucumber: 'Cucumber',
      behave: 'Behave',
      'pytest-bdd': 'pytest-bdd',
      'cucumber-js': 'Cucumber.js',
      appium: 'Appium',
      espresso: 'Espresso',
      detox: 'Detox',
      maestro: 'Maestro',
      maven: 'Maven',
      gradle: 'Gradle',
      pip: 'pip',
      poetry: 'Poetry',
      npm: 'npm',
      yarn: 'Yarn',
      'rest-assured': 'REST Assured',
      restassured: 'REST Assured',
      karate: 'Karate',
      requests: 'requests',
      'pytest-requests': 'pytest-requests',
      supertest: 'Supertest',
      axios: 'Axios',
      postgresql: 'PostgreSQL',
      mysql: 'MySQL',
      mongodb: 'MongoDB',
      jenkins: 'Jenkins',
      'github-actions': 'GitHub Actions',
      circleci: 'CircleCI',
      jira: 'Jira',
      testrail: 'TestRail',
      xray: 'Xray',
      git: 'Git',
      github: 'GitHub',
      gitlab: 'GitLab',
      bitbucket: 'Bitbucket',
      'azure-repos': 'Azure Repos'
    };
    return displayNames[value] || value;
  };

  const getTechPopularity = (key, value) => {
    if (!value || !getStepOptions) return null;
    const options = getStepOptions(key);
    const option = options.find(opt => opt.value === value);
    return option ? option.popularity : null;
  };

  return (
    <div 
      className="card slide-up"
      data-stagewise-element="tech-preview"
      data-stagewise-selected-count={selectedCount}
      data-stagewise-total-steps={totalSteps}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Your Tech Stack</h3>
        <div className="flex items-center text-white/70 text-sm">
          <span>{selectedCount}/{totalSteps}</span>
        </div>
      </div>

      {/* Selected Technologies */}
      <div className="space-y-3 mb-6">
        {Object.entries(selectedTech).map(([key, value]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
              value ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/10 border border-white/20'
            }`}
            data-stagewise-element="tech-item"
            data-stagewise-tech-category={key}
            data-stagewise-tech-value={value}
            data-stagewise-tech-label={getTechDisplayName(key, value)}
            data-stagewise-tech-popularity={getTechPopularity(key, value)}
          >
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg mr-3">
              {techIcons[key]}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">
                {techLabels[key]}
              </p>
              <p className={`text-sm ${
                value ? 'text-green-300' : 'text-white/50'
              }`}>
                {value ? getTechDisplayName(key, value) : 'Not selected'}
              </p>
              {value && getTechPopularity(key, value) && (
                <div className="mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Popularity</span>
                    <span className="text-white/80 text-xs font-semibold">
                      {getTechPopularity(key, value)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1 mt-1">
                    <motion.div
                      className={`h-1 rounded-full ${
                        getTechPopularity(key, value) >= 70 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        getTechPopularity(key, value) >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        getTechPopularity(key, value) >= 30 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                        'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${getTechPopularity(key, value)}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              )}
            </div>
            {value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

    </div>
  );
};

export default CombinationPreview;
