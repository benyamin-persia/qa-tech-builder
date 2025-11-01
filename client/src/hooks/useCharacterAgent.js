import { useState, useCallback } from 'react';
import axios from 'axios';

const MCP_SERVER_URL = process.env.REACT_APP_MCP_URL || 'http://localhost:3001';

export const useCharacterAgent = (userId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (character, message, context = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${MCP_SERVER_URL}/api/agent/chat`, {
        userId,
        character,
        message,
        context
      });

      return response.data;
    } catch (err) {
      console.error('Agent chat error:', err);
      setError(err.message);
      
      // Fallback response if server is unavailable
      return {
        character,
        response: getFallbackResponse(character, message),
        suggestions: [],
        timestamp: new Date().toISOString()
      };
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateContext = useCallback(async (updates) => {
    try {
      await axios.post(`${MCP_SERVER_URL}/api/agent/context/${userId}`, updates);
    } catch (err) {
      console.error('Context update error:', err);
    }
  }, [userId]);

  const getContext = useCallback(async () => {
    try {
      const response = await axios.get(`${MCP_SERVER_URL}/api/agent/context/${userId}`);
      return response.data;
    } catch (err) {
      console.error('Get context error:', err);
      return null;
    }
  }, [userId]);

  return {
    sendMessage,
    updateContext,
    getContext,
    isLoading,
    error
  };
};

// Fallback responses when MCP server is unavailable
const getFallbackResponse = (character, message) => {
  const lowerMessage = message.toLowerCase();
  const characters = {
    purple: {
      name: 'Blue',
      emoji: '😊',
      responses: [
        'Hi! I can help you with SQL basics and data validation. Need guidance on learning paths or navigation?',
        'Looking to improve your testing skills? I\'m here to help with queries and test planning! 😊',
        'Ready to start learning? Check out our SQL Lab or explore the Technology Builder!'
      ]
    },
    orange: {
      name: 'Orange',
      emoji: '🔍',
      responses: [
        'I specialize in API testing and debugging. Have a technical question? I can help!',
        'Let me help you troubleshoot and analyze test results. What do you need? 🔍',
        'Need help with API testing or automation? I\'ve got you covered!'
      ]
    },
    black: {
      name: 'Black',
      emoji: '💪',
      responses: [
        'Automation and CI/CD are my specialties! Ready to build powerful test frameworks?',
        'Let\'s create robust, scalable test automation together! What would you like to learn? 💪',
        'Want to dive into automation? I can guide you through frameworks and best practices!'
      ]
    },
    yellow: {
      name: 'Yellow',
      emoji: '🌟',
      responses: [
        'I love helping with QA fundamentals and mentoring! Got questions? Ask away!',
        'New to QA testing? I\'m here to guide you through the basics! 🌟',
        'Looking for QA best practices or learning resources? I can help!'
      ]
    }
  };

  const char = characters[character] || characters.yellow;
  const randResponse = char.responses[Math.floor(Math.random() * char.responses.length)];
  
  return `${char.emoji} ${randResponse}`;
};

export default useCharacterAgent;

