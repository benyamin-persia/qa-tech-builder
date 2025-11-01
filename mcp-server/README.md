# QA Tech Builder MCP Server

AI-powered character agent server that helps users navigate and learn on the QA Tech Builder website.

## Features

- 🤖 **Four AI Character Agents**: Each with unique personalities and expertise
  - **Blue (Purple)**: Optimistic SQL and data validation expert
  - **Orange**: Analytical API testing and debugging specialist
  - **Black**: Energetic automation and CI/CD guru
  - **Yellow**: Friendly QA fundamentals mentor

- 📚 **Knowledge Base**:
  - Website navigation assistance
  - Learning path recommendations
  - SQL Lab task guidance
  - Technology stack builder support

- 💬 **Conversational AI**:
  - Context-aware responses
  - Smart suggestions
  - Progress tracking
  - Personalized help

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
MCP_PORT=3001
NODE_ENV=development
```

## Running

```bash
# Development mode with auto-reload
npm run dev

# Production mode
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
  "response": "I can help you with SQL! Here are some tasks...",
  "suggestions": [
    { "text": "Open SQL Lab", "action": "navigate", "path": "/sql" }
  ],
  "timestamp": "2025-10-31T21:30:00.000Z"
}
```

### GET `/api/agent/context/:userId`
Get user's conversation and context history.

### POST `/api/agent/context/:userId`
Update user's context.

**Request:**
```json
{
  "currentPage": "/builder",
  "progress": { "completed": 10, "total": 14 }
}
```

### GET `/api/agents`
Get all available character agents.

## Integration with Frontend

The frontend can connect to this MCP server to enable real-time AI assistance through the animated characters. Each character can provide contextual help based on the user's current page, progress, and learning path.

## Character Personalities

| Character | Name | Specialty | Personality |
|-----------|------|-----------|-------------|
| purple | Blue | SQL Basics, Data Validation | Optimistic & Encouraging |
| orange | Orange | API Testing, Debugging | Analytical & Methodical |
| black | Black | Automation, CI/CD | Energetic & Confident |
| yellow | Yellow | QA Fundamentals | Friendly & Helpful |

## License

MIT

