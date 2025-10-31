// Technology icon mapping utility
// Maps technology names to their corresponding icon file paths

export const techIconMap = {
  // Programming Languages
  'java': '/icons/Java.png',
  'python': '/icons/Python.png',
  'javascript': '/icons/JavaScript.png',
  'typescript': '/icons/TypeScript.png',
  
  // UI Testing Frameworks
  'selenium': '/icons/Selenium.png',
  'playwright': '/icons/Playwrite.png', // Note: filename is "Playwrite.png"
  'cypress': '/icons/Cypress.png',
  
  // Test Frameworks
  'testng': '/icons/testng.png',
  'junit': '/icons/JUnit.png',
  'pytest': '/icons/pytest.png',
  'unittest': '/icons/Python.png', // Using Python icon for unittest
  'jest': '/icons/Jest.png',
  'mocha': '/icons/Mocha.png',
  
  // BDD Frameworks
  'cucumber': '/icons/Cucumber.png',
  'behave': '/icons/Python.png', // Using Python icon for Behave
  'pytest-bdd': '/icons/pytest.png',
  'cucumber-js': '/icons/Cucumber.png',
  
  // Mobile Testing
  'appium': '/icons/Appium.png',
  'espresso': '/icons/Android.png',
  'detox': '/icons/React.png', // Using React icon for Detox
  'maestro': '/icons/Mobile.png',
  
  // Build Tools
  'maven': '/icons/Apache-Maven.png',
  'gradle': '/icons/Gradle.png',
  'pip': '/icons/Python.png',
  'poetry': '/icons/Python-Poetry.png',
  'npm': '/icons/NPM.png',
  'yarn': '/icons/Yarn.png',
  
  // API Testing
  'restassured': '/icons/Rest Assured.png',
  'rest-assured': '/icons/Rest Assured.png',
  'karate': '/icons/Karate-Labs.png',
  'requests': '/icons/Python.png',
  'pytest-requests': '/icons/pytest.png',
  'supertest': '/icons/Node.js.png',
  'axios': '/icons/Axios.png',
  
  // Databases
  'postgresql': '/icons/PostgresSQL.png',
  'mysql': '/icons/MySQL.png',
  'mongodb': '/icons/MongoDB.png',
  'sqlite': '/icons/SQLite.png',
  'oracle': '/icons/Oracle.png',
  
  // CI/CD
  'jenkins': '/icons/Jenkins.png',
  'github-actions': '/icons/GitHub-Actions.png',
  'circleci': '/icons/CircleCI.png',
  'travis-ci': '/icons/Travis-CI.png',
  'azure-devops': '/icons/Azure-DevOps.png',
  
  // Test Management
  'jira': '/icons/Jira.png',
  'testrail': '/icons/TestRail.png',
  'xray': '/icons/Xray.png',
  'azure-boards': '/icons/Azure-Devops.png',
  'sonarqube': '/icons/SonarQube.png',
  
  // Version Control
  'git': '/icons/Git.png',
  'github': '/icons/GitHub.png',
  'gitlab': '/icons/GitLab.png',
  'bitbucket': '/icons/BitBucket.png',
  'azure-repos': '/icons/Azure-DevOps.png',
  
  // IDEs and Editors
  'intellij': '/icons/IntelliJ-IDEA.png',
  'eclipse': '/icons/Eclipse.png',
  'vscode': '/icons/Visual-Studio-Code-(VS-Code).png',
  'pycharm': '/icons/PyCharm.png',
  'webstorm': '/icons/WebStorm.png',
  
  // Other Tools
  'docker': '/icons/Docker.png',
  'kubernetes': '/icons/Kubernetes.png',
  'aws': '/icons/Amazon-Web-Services-(AWS).png',
  'postman': '/icons/Postman.png',
  'swagger': '/icons/Swagger.png',
  'allure': '/icons/Allure.png',
  'extent': '/icons/Extent-Reports.png'
};

// Function to get icon path for a technology
export const getTechIcon = (techName) => {
  const normalizedName = techName.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return techIconMap[normalizedName] || '/icons/Default.png';
};

// Function to get icon path with fallback
export const getTechIconWithFallback = (techName, fallbackIcon = '/icons/Default.png') => {
  const iconPath = getTechIcon(techName);
  return iconPath !== '/icons/Default.png' ? iconPath : fallbackIcon;
};

// Category icons for different technology types
export const categoryIcons = {
  language: '/icons/Code.png',
  uiTesting: '/icons/Selenium.png',
  testFramework: '/icons/TestNG.png',
  bddFramework: '/icons/Cucumber.png',
  mobileTesting: '/icons/Mobile.png',
  buildTool: '/icons/Maven.png',
  apiTesting: '/icons/Postman.png',
  database: '/icons/Database.png',
  cicd: '/icons/Jenkins.png',
  testManagement: '/icons/Jira.png',
  versionControl: '/icons/Git.png'
};

// Function to get category icon
export const getCategoryIcon = (category) => {
  return categoryIcons[category] || '/icons/Default.png';
};
