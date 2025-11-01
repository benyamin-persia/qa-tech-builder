# MCP Server Integration Guide

## Overview

The QA Tech Builder now includes an MCP (Model Context Protocol) server that provides AI-powered character agents to assist users with navigation, learning, and QA testing guidance.

## Architecture

### Backend: MCP Server (`/mcp-server`)

- **Technology**: Node.js + Express + MCP SDK
- **Port**: 3001 (configurable via `MCP_PORT` env variable)
- **Features**:
  - 4 AI character agents with unique personalities
  - Context-aware conversations
  - Learning path recommendations
  - Progress tracking
  - Website navigation assistance

### Frontend Integration

- **Hook**: `useCharacterAgent.js` - Custom React hook for agent communication
- **Component**: `AnimatedCharacters.js` - Now supports interactive chat
- **Features**:
  - Click characters to start conversations
  - Real-time chat interface
  - DaisyUI chat bubbles
  - Fallback responses when server unavailable

## Character Agents

| Character | Name | Specialty | Personality |
|-----------|------|-----------|-------------|
| Purple | Blue | SQL Basics, Data Validation | Optimistic & Encouraging |
| Orange | Orange | API Testing, Debugging | Analytical & Methodical |
| Black | Black | Automation, CI/CD | Energetic & Confident |
| Yellow | Yellow | QA Fundamentals | Friendly & Helpful |

## Running the System

### Development Mode

```bash
# Install all dependencies (first time only)
npm run install-all

# Run all servers concurrently
npm run dev
```

This starts:
- React frontend on port 3000
- Express backend on port 5000  
- MCP server on port 3001

### Production Mode

```bash
# Build frontend
npm run build

# Start backend
npm start

# Start MCP server separately
cd mcp-server
npm start
```

## API Endpoints

### POST `/api/agent/chat`
Send a message to a character agent.

**Request:**
```json
{
  "userId": "user123",
  "character": "purple",
  "message": "I need help with SQL",
  "context": {
    "currentPage": "/sql",
    "progress": { "completed": 5, "total": 14 }
  }
}
```

**Response:**
```json
{
  "character": "purple",
  "response": "I can help you with SQL! Here are some tips...",
  "suggestions": [
    { "text": "Open SQL Lab", "action": "navigate", "path": "/sql" }
  ],
  "timestamp": "2025-10-31T21:30:00.000Z"
}
```

### GET `/api/agent/context/:userId`
Get user's conversation history and context.

### POST `/api/agent/context/:userId`
Update user's context (current page, progress, etc.).

### GET `/api/agents`
List all available character agents.

## Usage in Frontend

### Example: Sending a Chat Message

```javascript
import useCharacterAgent from './hooks/useCharacterAgent';

function MyComponent() {
  const { sendMessage, isLoading, error } = useCharacterAgent('user123');
  
  const handleAsk = async () => {
    const response = await sendMessage('purple', 'Help me with SQL queries', {
      currentPage: window.location.pathname
    });
    
    console.log(response.response);
  };
  
  return <button onClick={handleAsk}>Ask Blue</button>;
}
```

### Character Click Interaction

Characters are now clickable! When clicked:
1. Opens a chat modal
2. Connects to MCP server
3. User can ask questions
4. Agent responds with contextual help

## Knowledge Base

The MCP server includes knowledge about:
- Website pages and navigation
- Learning paths (Manual QA, Automation, API, Performance, Security)
- Technology stacks and recommendations
- SQL Lab tasks and progress
- Best practices for QA testing

## Configuration

### Environment Variables

Create `.env` file in `mcp-server/`:
```
MCP_PORT=3001
NODE_ENV=development
```

### Frontend Configuration

Set `REACT_APP_MCP_URL` in client `.env`:
```
REACT_APP_MCP_URL=http://localhost:3001
```

## Testing

### Test MCP Server
```bash
cd mcp-server
npm start

# In another terminal
curl http://localhost:3001/health
curl http://localhost:3001/api/agents
```

### Test Character Chat
1. Open the website
2. Click on any character
3. Type a message
4. Receive AI-powered response

## Future Enhancements

- Add persistent conversation history to database
- Integrate with OpenAI/Claude for more advanced AI
- Add voice interactions
- Implement multi-turn conversations
- Add learning recommendations based on progress
- Create specialized agents for different testing domains

## Troubleshooting

### MCP Server Not Starting
- Check if port 3001 is available
- Verify all dependencies are installed: `cd mcp-server && npm install`

### Characters Not Responding
- Check browser console for errors
- Verify MCP server is running: `curl http://localhost:3001/health`
- Check network tab for failed API calls

### Fallback Responses Only
- Server might be down
- Check server logs
- Verify environment variables are set correctly

## License

MIT

