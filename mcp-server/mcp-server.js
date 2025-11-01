#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * MCP Server for QA Tech Builder
 * This server exposes tools and resources for AI agents to interact with the website
 */

// Import shared data
import { KNOWLEDGE_BASE, CHARACTER_AGENTS } from './shared-data.js';

// Create MCP server instance
const server = new Server(
  {
    name: "qa-tech-builder",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Tool: get_learning_paths
 * Returns available learning paths for QA testing
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_learning_paths",
      description: "Get all available learning paths for QA testing",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "get_sql_tasks",
      description: "Get SQL Lab tasks and exercises",
      inputSchema: {
        type: "object",
        properties: {
          difficulty: {
            type: "number",
            description: "Filter by difficulty level (1-5)",
            enum: [1, 2, 3, 4, 5],
          },
        },
      },
    },
    {
      name: "get_technologies",
      description: "Get available QA technologies by category",
      inputSchema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Technology category",
            enum: ["languages", "uiTesting", "apiTesting", "frameworks", "databases", "cicd", "all"],
          },
        },
      },
    },
    {
      name: "get_character_info",
      description: "Get information about character agents",
      inputSchema: {
        type: "object",
        properties: {
          character: {
            type: "string",
            description: "Character to get info for",
            enum: ["purple", "orange", "black", "yellow"],
          },
        },
      },
    },
    {
      name: "get_sql_query_example",
      description: "Get an example SQL query for QA testing",
      inputSchema: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "Type of query example",
            enum: ["select", "insert", "update", "delete", "join"],
          },
        },
      },
    },
  ],
}));

/**
 * Handle tool execution requests
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_learning_paths":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                KNOWLEDGE_BASE.learningPaths.map((path) => ({
                  id: path.id,
                  name: path.name,
                  skills: path.skills,
                })),
                null,
                2
              ),
            },
          ],
        };

      case "get_sql_tasks":
        const difficulty = args?.difficulty;
        let tasks = KNOWLEDGE_BASE.sqlTasks;
        
        if (difficulty) {
          tasks = tasks.filter((task) => task.difficulty === difficulty);
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(tasks, null, 2),
            },
          ],
        };

      case "get_technologies":
        const category = args?.category || "all";
        let techs;
        
        if (category === "all") {
          techs = KNOWLEDGE_BASE.technologies;
        } else if (KNOWLEDGE_BASE.technologies[category]) {
          techs = { [category]: KNOWLEDGE_BASE.technologies[category] };
        } else {
          throw new Error(`Invalid category: ${category}`);
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(techs, null, 2),
            },
          ],
        };

      case "get_character_info":
        const character = args?.character;
        if (!character || !CHARACTER_AGENTS[character]) {
          throw new Error(`Invalid character: ${character}`);
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(CHARACTER_AGENTS[character], null, 2),
            },
          ],
        };

      case "get_sql_query_example":
        const queryType = args?.type || "select";
        const examples = {
          select: `-- Example: Select all test users\nSELECT user_id, username, email, test_flag\nFROM users\nWHERE test_flag = 1\nORDER BY user_id;`,
          insert: `-- Example: Insert a new test user\nINSERT INTO users (username, email, test_flag)\nVALUES ('test_user_001', 'test@example.com', 1);`,
          update: `-- Example: Update test user data\nUPDATE users\nSET email = 'new_test@example.com'\nWHERE user_id = 100 AND test_flag = 1;`,
          delete: `-- Example: Delete test data\nDELETE FROM users\nWHERE test_flag = 1 AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);`,
          join: `-- Example: Join users with orders for QA validation\nSELECT u.user_id, u.username, o.order_id, o.total_amount, o.status\nFROM users u\nINNER JOIN orders o ON u.user_id = o.user_id\nWHERE u.test_flag = 1 AND o.status = 'pending'\nORDER BY o.order_id;`,
        };
        
        return {
          content: [
            {
              type: "text",
              text: examples[queryType] || examples.select,
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the MCP server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("QA Tech Builder MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in MCP server:", error);
  process.exit(1);
});

