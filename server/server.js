const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for secure cookies
app.set('trust proxy', 1);

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qa-tech-builder';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.log('⚠️  Running in demo mode without database');
});

// Middleware order is important
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false
}));

app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:3000', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: { error: 'Too many requests, please try again later' }
});

app.use('/api', generalLimiter);

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Technology compatibility data
const technologyCompatibility = {
  java: {
    uiTesting: ['selenium', 'playwright'],
    testFramework: ['testng', 'junit'],
    bddFramework: ['cucumber'],
    buildTool: ['maven', 'gradle'],
    apiTesting: ['rest-assured', 'karate'],
    database: ['postgresql', 'mysql', 'oracle', 'mongodb'],
    cicd: ['jenkins', 'github-actions'],
    testManagement: ['jira', 'xray']
  },
  python: {
    uiTesting: ['selenium', 'playwright'],
    testFramework: ['pytest', 'unittest'],
    bddFramework: ['behave', 'pytest-bdd'],
    buildTool: ['pip', 'poetry'],
    apiTesting: ['requests', 'pytest-requests'],
    database: ['postgresql', 'mysql', 'mongodb'],
    cicd: ['jenkins', 'github-actions'],
    testManagement: ['jira', 'testrail']
  },
  javascript: {
    uiTesting: ['playwright', 'cypress'],
    testFramework: ['jest', 'mocha'],
    bddFramework: ['cucumber-js'],
    buildTool: ['npm', 'yarn'],
    apiTesting: ['supertest', 'axios'],
    database: ['postgresql', 'mongodb'],
    cicd: ['github-actions', 'circleci'],
    testManagement: ['jira', 'testrail']
  }
};

const technologyDetails = {
  java: { name: 'Java', description: 'Object-oriented programming', icon: '☕' },
  python: { name: 'Python', description: 'High-level programming', icon: '🐍' },
  javascript: { name: 'JavaScript', description: 'Web programming', icon: '🟨' },
  selenium: { name: 'Selenium', description: 'Web automation', icon: '🌐' },
  playwright: { name: 'Playwright', description: 'Modern web testing', icon: '🎭' },
  cypress: { name: 'Cypress', description: 'End-to-end testing', icon: '🌲' },
  testng: { name: 'TestNG', description: 'Testing framework', icon: '🧪' },
  junit: { name: 'JUnit', description: 'Unit testing', icon: '🔬' },
  pytest: { name: 'pytest', description: 'Python testing', icon: '🐍' },
  unittest: { name: 'unittest', description: 'Python unit testing', icon: '📋' },
  jest: { name: 'Jest', description: 'JavaScript testing', icon: '⚡' },
  mocha: { name: 'Mocha', description: 'JavaScript testing', icon: '☕' },
  cucumber: { name: 'Cucumber', description: 'BDD framework', icon: '🥒' },
  behave: { name: 'Behave', description: 'Python BDD', icon: '🐻' },
  'pytest-bdd': { name: 'pytest-bdd', description: 'Python BDD', icon: '🐍' },
  'cucumber-js': { name: 'Cucumber.js', description: 'JavaScript BDD', icon: '🥒' },
  maven: { name: 'Maven', description: 'Build tool', icon: '🏗️' },
  gradle: { name: 'Gradle', description: 'Build tool', icon: '📦' },
  pip: { name: 'pip', description: 'Package manager', icon: '📦' },
  poetry: { name: 'Poetry', description: 'Dependency management', icon: '📚' },
  npm: { name: 'npm', description: 'Package manager', icon: '📦' },
  yarn: { name: 'Yarn', description: 'Package manager', icon: '🧶' },
  'rest-assured': { name: 'REST Assured', description: 'API testing', icon: '🔗' },
  karate: { name: 'Karate', description: 'API testing', icon: '🥋' },
  requests: { name: 'Requests', description: 'HTTP library', icon: '🌐' },
  'pytest-requests': { name: 'pytest-requests', description: 'API testing', icon: '🔗' },
  supertest: { name: 'Supertest', description: 'API testing', icon: '🚀' },
  axios: { name: 'Axios', description: 'HTTP client', icon: '📡' },
  postgresql: { name: 'PostgreSQL', description: 'Database', icon: '🐘' },
  mysql: { name: 'MySQL', description: 'Database', icon: '🐬' },
  oracle: { name: 'Oracle', description: 'Database', icon: '🏛️' },
  mongodb: { name: 'MongoDB', description: 'NoSQL database', icon: '🍃' },
  jenkins: { name: 'Jenkins', description: 'CI/CD', icon: '🔧' },
  'github-actions': { name: 'GitHub Actions', description: 'CI/CD', icon: '⚡' },
  circleci: { name: 'CircleCI', description: 'CI/CD', icon: '⭕' },
  jira: { name: 'Jira', description: 'Project management', icon: '🎯' },
  testrail: { name: 'TestRail', description: 'Test management', icon: '🚂' },
  xray: { name: 'Xray', description: 'Test management', icon: '👁️' }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Technology compatibility endpoint
app.get('/api/technology-compatibility', (req, res) => {
  res.json(technologyCompatibility);
});

// Get all valid combinations
app.get('/api/combinations', (req, res) => {
  const combinations = [];
  
  Object.keys(technologyCompatibility).forEach(language => {
    const compatibility = technologyCompatibility[language];
    
    // Generate sample combinations
    compatibility.uiTesting.forEach(uiTesting => {
      compatibility.testFramework.forEach(testFramework => {
        compatibility.buildTool.forEach(buildTool => {
          combinations.push({
            language,
            uiTesting,
            testFramework,
            buildTool,
            name: `${technologyDetails[language].name} + ${technologyDetails[uiTesting].name} + ${technologyDetails[testFramework].name}`,
            description: `A ${language} stack with ${uiTesting} and ${testFramework}`
          });
        });
      });
    });
  });
  
  res.json(combinations);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 QA Tech Builder API running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`👤 User endpoints: http://localhost:${PORT}/api/user`);
});