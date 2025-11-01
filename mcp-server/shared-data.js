/**
 * Shared data for QA Tech Builder
 * Used by both the MCP server and the Express API server
 */

// Character Agents Configuration
export const CHARACTER_AGENTS = {
  purple: {
    name: 'Blue',
    personality: 'Optimistic and encouraging',
    expertise: 'SQL basics, data validation, test planning',
    tone: 'Friendly and supportive, uses emojis 😊',
    color: 'primary'
  },
  orange: {
    name: 'Orange',
    personality: 'Analytical and methodical',
    expertise: 'API testing, debugging, troubleshooting',
    tone: 'Professional and detail-oriented 🔍',
    color: 'warning'
  },
  black: {
    name: 'Black',
    personality: 'Energetic and confident',
    expertise: 'Automation, CI/CD, test frameworks',
    tone: 'Enthusiastic and motivating 💪',
    color: 'neutral'
  },
  yellow: {
    name: 'Yellow',
    personality: 'Friendly and helpful',
    expertise: 'QA fundamentals, best practices, mentoring',
    tone: 'Cheerful and encouraging 🌟',
    color: 'accent'
  }
};

// Knowledge base for website navigation and learning paths
export const KNOWLEDGE_BASE = {
  pages: [
    { name: 'Landing Page', path: '/', description: 'Main entry point to explore QA technologies' },
    { name: 'Technology Builder', path: '/builder', description: 'Build custom QA tech stacks' },
    { name: 'Tutorial Page', path: '/tutorial', description: 'View selected learning path' },
    { name: 'SQL Lab', path: '/sql', description: 'Interactive SQL practice for QA testers' }
  ],
  learningPaths: [
    { id: 'manual', name: 'Manual QA Tester', skills: ['Exploratory testing', 'Bug tracking', 'Test case design'] },
    { id: 'automation', name: 'Automation Engineer', skills: ['Selenium', 'Test frameworks', 'CI/CD'] },
    { id: 'api', name: 'API Tester', skills: ['REST APIs', 'Postman', 'Test automation'] },
    { id: 'performance', name: 'Performance Tester', skills: ['Load testing', 'JMeter', 'Optimization'] },
    { id: 'security', name: 'Security Tester', skills: ['Vulnerability testing', 'OWASP', 'Penetration testing'] }
  ],
  technologies: {
    languages: ['Java', 'Python', 'JavaScript', 'TypeScript'],
    uiTesting: ['Selenium', 'Playwright', 'Cypress'],
    apiTesting: ['REST Assured', 'Karate', 'Postman', 'Supertest'],
    frameworks: ['TestNG', 'JUnit', 'pytest', 'Jest'],
    databases: ['PostgreSQL', 'MySQL', 'MongoDB'],
    cicd: ['Jenkins', 'GitHub Actions', 'CircleCI']
  },
  sqlTasks: [
    { id: 1, title: 'Verify Test Users', chapter: 1, difficulty: 1 },
    { id: 2, title: 'Check Active Products', chapter: 1, difficulty: 1 },
    { id: 3, title: 'Find Data Quality Issues', chapter: 2, difficulty: 2 },
    { id: 4, title: 'Validate Order Totals', chapter: 2, difficulty: 2 }
  ]
};

