import React from 'react';
import { ExpandingCards } from './ui/expanding-cards';
import { TechStackAccordion } from './ui/interactive-image-accordion';
import { getTechIcon, getCategoryIcon } from '../utils/techIcons';
import { useUser } from '../contexts/UserContext';

const TechStackPreview = ({ selectedTech, getStepOptions }) => {
  const { userProfile, updateCharactersPosition } = useUser();
  // Create tech items for the expanding cards
  const createTechItems = () => {
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
      if (!value || !getStepOptions) return 0;
      const options = getStepOptions(key);
      const option = options.find(opt => opt.value === value);
      return option ? option.popularity : 0;
    };

    // Technology icons mapping - using actual technology icons
    const getTechIconComponent = (value) => {
      const iconPath = getTechIcon(value);
      return (
        <img 
          src={iconPath} 
          alt={`${value} icon`}
          className="w-8 h-8 object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    };

    return Object.entries(selectedTech)
      .filter(([key, value]) => {
        // Filter out empty values
        if (value === '' || value === null || value === undefined) return false;
        // Filter out empty arrays
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      })
      .map(([key, value]) => {
        // Handle arrays (e.g., versionControl) - combine into single card
        const values = Array.isArray(value) ? value : [value];
        const labels = values.map(singleValue => getTechDisplayName(key, singleValue));
        const icons = values.map(singleValue => getTechIconComponent(singleValue));
        const popularities = values.map(singleValue => getTechPopularity(key, singleValue));
        const avgPopularity = popularities.reduce((sum, p) => sum + p, 0) / popularities.length;
        
        // Get the first icon URL for background image
        const firstValue = Array.isArray(value) ? value[0] : value;
        const iconUrl = firstValue ? getTechIcon(firstValue) : null;
        
        return {
          id: key,
          title: labels.join(' + '),
          description: `${techLabels[key]} - ${labels.join(' + ')}`,
          imageUrl: iconUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%234f46e5;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%238b5cf6;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grad)" /%3E%3C/svg%3E',
          icon: <div className="flex gap-2 items-center">{icons.map((icon, idx) => <div key={idx}>{icon}</div>)}</div>,
          popularity: Math.round(avgPopularity),
          category: key
        };
      });
  };

  const techItems = createTechItems();

  if (techItems.length === 0) {
    return (
      <div className="card slide-up">
        <div className="text-center py-8">
          <h3 className="text-xl font-bold text-white mb-2">Your Tech Stack</h3>
          <p className="text-white/70">Select technologies to see your stack</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card slide-up relative">
      {/* Content */}
      <div className="relative z-10">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Your Tech Stack</h3>
          <p className="text-white/70 text-sm">
            {techItems.length} technologies selected
          </p>
        </div>
        <TechStackAccordion items={techItems} defaultActiveIndex={0} />
      </div>
    </div>
  );
};

export default TechStackPreview;
