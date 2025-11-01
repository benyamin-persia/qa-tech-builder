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
import axios from 'axios';

// Import shared data
import { KNOWLEDGE_BASE, CHARACTER_AGENTS } from './shared-data.js';

dotenv.config();

const app = express();
const PORT = process.env.MCP_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// Helper function to get LLM response from Ollama
async function getLLMResponse(prompt, context) {
  try {
    // Check if Ollama is running locally
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama3.2', // or your preferred model
      prompt: prompt,
      stream: false
    }, {
      timeout: 10000 // 10 second timeout
    });
    
    return response.data.response;
  } catch (error) {
    // If Ollama is not available, return null to use fallback
    console.log('Ollama not available, using rule-based responses:', error.message);
    return null;
  }
}

// Generate AI response based on character and context
async function generateAgentResponse(character, userMessage, context) {
  const agent = CHARACTER_AGENTS[character];
  if (!agent) return null;

  // Try to get LLM response first
  // Build user's tech stack info
  const userTechStack = context.selections ? 
    Object.entries(context.selections.data || {})
      .filter(([_, value]) => value && value !== '')
      .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').trim()}: ${value}`)
      .join(', ') : 'None selected yet';
  
  const prompt = `You are ${agent.name}, a ${agent.personality} QA Assistant specializing in ${agent.expertise}.
  
Your personality: ${agent.personality}
Your tone: ${agent.tone}

User asked: "${userMessage}"

Website Context:
- Available pages: ${KNOWLEDGE_BASE.pages.map(p => p.name).join(', ')}
- Learning paths: ${KNOWLEDGE_BASE.learningPaths.map(p => p.name).join(', ')}
- SQL tasks available: ${KNOWLEDGE_BASE.sqlTasks.length}
- Technologies: ${Object.values(KNOWLEDGE_BASE.technologies).flat().slice(0, 5).join(', ')}

User's Selected Tech Stack: ${userTechStack}

Provide a CONCISE, helpful response (max 50 words). Be brief, friendly, and encouraging. Use 1-2 emojis max.`;

  const llmResponse = await getLLMResponse(prompt, context);
  
  // If LLM is available, use it
  if (llmResponse) {
    return {
      message: llmResponse,
      suggestions: []
    };
  }

  // Fall back to rule-based responses if LLM not available
  const lowerMessage = userMessage.toLowerCase();

  // Check if user is asking about their tech stack
  if (lowerMessage.includes('technology') && (lowerMessage.includes('choose') || lowerMessage.includes('select') || lowerMessage.includes('pick') || lowerMessage.includes('tutorial') || lowerMessage.includes('what'))) {
    if (userTechStack !== 'None selected yet' && Object.keys(context.selections?.data || {}).some(key => context.selections.data[key] && context.selections.data[key] !== '')) {
      return {
        message: `Based on what you've selected in the Technology Builder, your tech stack includes: ${userTechStack}. Great choices! Want to refine your stack or start learning?`,
        suggestions: [{ text: 'Open Technology Builder', action: 'navigate', path: '/builder' }, { text: 'Start Learning', action: 'navigate', path: '/tutorial' }]
      };
    } else {
      return {
        message: `You haven't selected any technologies yet! Let's build your perfect QA tech stack. Would you like to explore the Technology Builder?`,
        suggestions: [{ text: 'Open Technology Builder', action: 'navigate', path: '/builder' }]
      };
    }
  }

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

  // SQL Lab help and SQL query examples - specific patterns first
  if ((lowerMessage.includes('create') && lowerMessage.includes('sql')) || 
      lowerMessage.includes('select query') || 
      lowerMessage.includes('example of select') || 
      lowerMessage.includes('sql example') ||
      lowerMessage.includes('simple sql') ||
      (lowerMessage.includes('sql') && lowerMessage.includes('write')) ||
      (lowerMessage.includes('query') && lowerMessage.includes('write'))) {
    const example = agent.name === 'Orange' ? 
      'SELECT customer_id, first_name, email FROM customers WHERE test_user = 1;' :
      'SELECT * FROM products WHERE active = 1;';
    
    return {
      message: `Here's a basic SELECT query example:\n\`\`\`sql\n${example}\n\`\`\`\n\nThis query retrieves data from a table. Would you like to practice more in the SQL Lab?`,
      suggestions: [{ text: 'Open SQL Lab', action: 'navigate', path: '/sql' }]
    };
  }

  if (lowerMessage.includes('sql') || lowerMessage.includes('database') || lowerMessage.includes('query')) {
    return {
      message: `Our SQL Lab has ${KNOWLEDGE_BASE.sqlTasks.length} tasks to practice! Start with basic queries and work your way up. Want a SELECT query example?`,
      suggestions: [{ text: 'Open SQL Lab', action: 'navigate', path: '/sql' }, { text: 'Show SQL example', action: 'help', type: 'sql-example' }]
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

  // Specific QA questions
  if (lowerMessage.includes('what is') && lowerMessage.includes('qa') || lowerMessage.includes('quality assurance')) {
    return {
      message: `QA (Quality Assurance) is the systematic process of ensuring software meets quality standards. It involves testing, bug tracking, and verification to prevent defects in production. Would you like to explore our learning paths?`,
      suggestions: [{ text: 'Learning paths', action: 'help', type: 'paths' }]
    };
  }

  if (lowerMessage.includes('how to') && lowerMessage.includes('test')) {
    const guide = agent.name === 'Blue' ? 
      'Start by understanding requirements, create test cases, execute them, report bugs, and verify fixes.' :
      'Plan tests, write test cases, execute systematically, track defects, and validate outcomes. Want to practice in our SQL Lab?';
    
    return {
      message: guide,
      suggestions: [{ text: 'Open SQL Lab', action: 'navigate', path: '/sql' }]
    };
  }

  // General encouragement
  return {
    message: `I'm here to help you succeed in QA testing! ${agent.tone} You can ask me about SQL queries, testing basics, navigation, or learning paths.`,
    suggestions: [
      { text: 'SQL query example', action: 'help', type: 'sql-example' },
      { text: 'Learning paths', action: 'help', type: 'paths' },
      { text: 'Testing basics', action: 'help', type: 'basics' }
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
    const response = await generateAgentResponse(character, message, { ...userContext, ...context });

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

