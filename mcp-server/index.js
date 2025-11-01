#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.MCP_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Character Agents Configuration
const CHARACTER_AGENTS = {
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
const KNOWLEDGE_BASE = {
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

// Context Manager for user interactions
class ContextManager {
  constructor() {
    this.sessions = new Map();
  }

  getSession(userId) {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        currentPage: '/',
        selectedPath: null,
        completedTasks: [],
        progress: { completed: 0, total: 0 },
        conversationHistory: []
      });
    }
    return this.sessions.get(userId);
  }

  updateContext(userId, updates) {
    const session = this.getSession(userId);
    Object.assign(session, updates);
  }

  addConversation(userId, character, message, response) {
    const session = this.getSession(userId);
    session.conversationHistory.push({
      character,
      message,
      response,
      timestamp: new Date().toISOString()
    });
    // Keep only last 50 conversations
    if (session.conversationHistory.length > 50) {
      session.conversationHistory.shift();
    }
  }
}

const contextManager = new ContextManager();

// Generate AI response based on character and context
function generateAgentResponse(character, userMessage, context) {
  const agent = CHARACTER_AGENTS[character];
  if (!agent) return null;

  const lowerMessage = userMessage.toLowerCase();

  // Navigational help
  if (lowerMessage.includes('navigate') || lowerMessage.includes('go to') || lowerMessage.includes('page')) {
    const pages = KNOWLEDGE_BASE.pages.map(p => `"${p.name}" at ${p.path}`).join(', ');
    return {
      message: `${agent.personality === 'Optimistic and encouraging' ? '😊' : agent.personality === 'Analytical and methodical' ? '🔍' : agent.personality === 'Energetic and confident' ? '💪' : '🌟'} You can explore these pages on our website: ${pages}. Which one would you like to visit?`,
      suggestions: KNOWLEDGE_BASE.pages.map(p => ({ text: `Go to ${p.name}`, action: 'navigate', path: p.path }))
    };
  }

  // Learning path guidance
  if (lowerMessage.includes('learn') || lowerMessage.includes('learning path') || lowerMessage.includes('skill')) {
    const paths = KNOWLEDGE_BASE.learningPaths.map(p => `${p.name} (${p.skills.join(', ')})`).join('\n');
    return {
      message: `Here are the learning paths available: ${paths}. What interests you most?`,
      suggestions: KNOWLEDGE_BASE.learningPaths.map(p => ({ text: `Learn ${p.name}`, action: 'path', pathId: p.id }))
    };
  }

  // SQL Lab help
  if (lowerMessage.includes('sql') || lowerMessage.includes('database') || lowerMessage.includes('query')) {
    return {
      message: `Our SQL Lab has ${KNOWLEDGE_BASE.sqlTasks.length} tasks to practice! Start with basic queries and work your way up. Need help with a specific task?`,
      suggestions: [{ text: 'Open SQL Lab', action: 'navigate', path: '/sql' }]
    };
  }

  // Technology recommendations
  if (lowerMessage.includes('technology') || lowerMessage.includes('tech') || lowerMessage.includes('tool')) {
    const techs = Object.values(KNOWLEDGE_BASE.technologies).flat().join(', ');
    return {
      message: `Popular QA technologies include: ${techs}. Want to build a tech stack? Check out the Technology Builder!`,
      suggestions: [{ text: 'Build Tech Stack', action: 'navigate', path: '/builder' }]
    };
  }

  // Progress and motivation
  if (lowerMessage.includes('progress') || lowerMessage.includes('completed') || lowerMessage.includes('done')) {
    const { completed, total } = context.progress || { completed: 0, total: 0 };
    if (completed === 0) {
      return {
        message: `You're just starting! Everyone begins somewhere. Ready to tackle your first task? 🚀`,
        suggestions: [{ text: 'Start Learning', action: 'navigate', path: '/tutorial' }]
      };
    }
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      message: `You've completed ${completed} out of ${total} tasks (${percent}%)! Keep up the great work! 💪`,
      suggestions: []
    };
  }

  // General encouragement
  return {
    message: `I'm here to help you succeed in QA testing! ${agent.tone} You can ask me about navigation, learning paths, SQL practice, or anything about quality assurance testing.`,
    suggestions: [
      { text: 'Navigate website', action: 'help', type: 'navigation' },
      { text: 'Learning paths', action: 'help', type: 'paths' },
      { text: 'SQL Lab', action: 'help', type: 'sql' }
    ]
  };
}

// Express API endpoints
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { userId, character, message, context } = req.body;

    if (!userId || !character || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userContext = contextManager.getSession(userId);
    const response = generateAgentResponse(character, message, { ...userContext, ...context });

    // Store conversation
    contextManager.addConversation(userId, character, message, response.message);

    res.json({
      character,
      response: response.message,
      suggestions: response.suggestions || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/agent/context/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const context = contextManager.getSession(userId);
    res.json(context);
  } catch (error) {
    console.error('Context error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/agent/context/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    contextManager.updateContext(userId, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Update context error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/agents', (req, res) => {
  res.json(CHARACTER_AGENTS);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🤖 QA Tech Builder MCP Server running on port ${PORT}`);
  console.log(`📊 ${Object.keys(CHARACTER_AGENTS).length} AI agents loaded`);
});

export { app, contextManager, CHARACTER_AGENTS, KNOWLEDGE_BASE };

