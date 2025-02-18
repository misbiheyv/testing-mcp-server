import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Implementation} from '@modelcontextprotocol/sdk/types.js';
import type {ServerOptions} from '@modelcontextprotocol/sdk/server/index.js';

import pkg from '../../package.json' with {type: 'json'};

import * as tools from './tools/index.js';
import * as resources from './resources/index.js';
import * as prompts from './prompts/index.js';

export async function startServer(info: Partial<Implementation> = {}, opts: Partial<ServerOptions> = {}) {
  const server = new McpServer({
    name: pkg.name,
    version: pkg.version,
    ...info
  }, opts);

  await Promise.all(
    [
      Object.values(tools).map((registerTool) => registerTool(server)),
      Object.values(resources).map((registerResource) => registerResource(server)),
      Object.values(prompts).map((registerPrompt) => registerPrompt(server))
    ].flat()
  );

  const transport = new StdioServerTransport();

  server.connect(transport).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
