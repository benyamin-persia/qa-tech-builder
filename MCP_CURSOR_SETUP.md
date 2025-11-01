# MCP Cursor AI Integration Setup

## Overview

This document explains how to set up the MCP (Model Context Protocol) server to connect your QA Tech Builder website with Cursor AI.

## What is MCP?

Model Context Protocol (MCP) is a standardized way for AI assistants to access external data sources and tools. By setting up an MCP server, you enable Cursor AI to understand and interact with your website's knowledge base.

## Architecture

```
Cursor AI → MCP Server → Website Knowledge Base
                ↓
         Express API Server → Animated Characters
```

### Two Server Setup:

1. **MCP Server** (`mcp-server.js`): Connects to Cursor AI via stdio transport
   - Exposes tools and resources
   - Accessible only by Cursor AI
   - Provides website knowledge to AI

2. **Express API Server** (`index.js`): HTTP API for website frontend
   - Handles character chat interactions
   - Manages user sessions
   - Powers the animated characters' AI responses

## Configuration

### Step 1: MCP Configuration File

Your MCP server is configured in Cursor's configuration file:

**Location**: `C:\Users\<your-username>\.cursor\mcp.json`

**Configuration**:
```json
{
  "mcpServers": {
    "qa-tech-builder": {
      "command": "node",
      "args": [
        "E:\\qa testing tutition\\qa-tech-builder\\mcp-server\\mcp-server.js"
      ],
      "cwd": "E:\\qa testing tutition\\qa-tech-builder\\mcp-server"
    }
  }
}
```

### Step 2: Update Paths (Important!)

If your project path is different, update the `args` and `cwd` values in the configuration file to match your actual project location.

**To find your project path:**
```powershell
cd "your-project-path\qa-tech-builder"
node -e "console.log(require('path').resolve('./mcp-server/mcp-server.js'))"
```

## How to Use

### 1. Restart Cursor

After configuring the MCP server, restart Cursor to load the new MCP server.

### 2. Available Tools in Cursor

Once connected, Cursor AI can use these tools to help you with the website:

#### **get_learning_paths**
Get all available learning paths for QA testing.

**Usage in Cursor**: "What learning paths are available?"

#### **get_sql_tasks**
Get SQL Lab tasks and exercises, optionally filtered by difficulty.

**Usage in Cursor**: "Show me SQL tasks with difficulty 2"

#### **get_technologies**
Get available QA technologies by category.

**Usage in Cursor**: "What UI testing frameworks are available?"

**Categories**: `languages`, `uiTesting`, `apiTesting`, `frameworks`, `databases`, `cicd`, `all`

#### **get_character_info**
Get information about character agents.

**Usage in Cursor**: "Tell me about the Blue character"

**Characters**: `purple` (Blue), `orange`, `black`, `yellow`

#### **get_sql_query_example**
Get example SQL queries for QA testing.

**Usage in Cursor**: "Show me a SQL JOIN example"

**Query Types**: `select`, `insert`, `update`, `delete`, `join`

## Example Interactions

### Example 1: Learning Paths
**You**: "What learning paths can users choose from?"

**Cursor AI** (using MCP): *Runs `get_learning_paths` tool and receives:*
```json
[
  {
    "id": "manual",
    "name": "Manual QA Tester",
    "skills": ["Exploratory testing", "Bug tracking", "Test case design"]
  },
  {
    "id": "automation",
    "name": "Automation Engineer",
    "skills": ["Selenium", "Test frameworks", "CI/CD"]
  }
  // ... more paths
]
```

### Example 2: SQL Tasks
**You**: "What SQL tasks are available for beginners?"

**Cursor AI**: *Runs `get_sql_tasks` with difficulty=1*

### Example 3: Technology Stack
**You**: "What technologies should I use for API testing?"

**Cursor AI**: *Runs `get_technologies` with category=apiTesting*

## Knowledge Base

The MCP server provides access to:

- **Website Pages**: Landing, Builder, Tutorial, SQL Lab
- **Learning Paths**: Manual QA, Automation, API, Performance, Security
- **Technologies**: Languages, Testing Frameworks, Databases, CI/CD Tools
- **SQL Tasks**: Exercise library with difficulty levels
- **Character Agents**: AI personalities and their expertise

## Troubleshooting

### Issue: MCP server not loading

**Solution**: 
1. Check that the paths in `mcp.json` are correct
2. Verify Node.js is installed and accessible
3. Restart Cursor completely
4. Check Cursor's developer console for error messages

### Issue: Tools not available in Cursor

**Solution**:
1. Ensure MCP server file exists at the configured path
2. Check that all dependencies are installed: `npm install` in `mcp-server/`
3. Test the server manually: `node mcp-server.js`
4. Look for connection errors in Cursor's output

### Issue: Import errors

**Solution**:
1. Verify `shared-data.js` exists in the same directory
2. Check that all exports are correct
3. Ensure ES modules are properly configured in `package.json`

## Development

### Running Locally

```powershell
# Install dependencies (first time only)
cd qa-tech-builder/mcp-server
npm install

# Test MCP server
npm run mcp

# Run Express API server (for website frontend)
npm run server

# Run both (development)
cd ..
npm run dev
```

### Adding New Tools

To add a new tool to the MCP server:

1. Edit `mcp-server/mcp-server.js`
2. Add tool definition to `ListToolsRequestSchema` handler
3. Add tool logic to `CallToolRequestSchema` handler
4. Restart Cursor to load changes

### Sharing Data

Common data structures are stored in `shared-data.js` and imported by:
- `mcp-server.js` (for Cursor AI)
- `index.js` (for Express API)

This ensures consistency between both servers.

## Benefits

✅ **Contextual AI Assistance**: Cursor AI understands your website's structure and content
✅ **Intelligent Code Suggestions**: AI can suggest features based on available learning paths
✅ **Knowledge-Driven Development**: Build new features informed by existing knowledge base
✅ **Consistent Data**: Single source of truth for website knowledge

## Next Steps

1. Test the MCP connection in Cursor
2. Try asking about learning paths, SQL tasks, or technologies
3. Build new features with AI assistance
4. Expand the knowledge base as needed

## Support

For issues or questions:
- Check Cursor's MCP documentation
- Review the MCP specification
- Inspect Cursor's developer console for errors

