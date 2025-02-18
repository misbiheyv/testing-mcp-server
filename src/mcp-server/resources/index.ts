import type {ListResourcesResult} from '@modelcontextprotocol/sdk/types.js';
import {ResourceTemplate} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {ListResourcesCallback, McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';

import {getTestCase, getTestCasesList} from '../../tms/index.js';
import {readFileSync} from '../../fs/index.js';

export const testingDocsResource = (server: McpServer) => server.resource(
  'testing-docs',
  'docs://testing-docs',
  {
    description: 'Ресурс предоставляет полную документацию по написанию авто-тестов',
    mimeType: 'text/plain'
  },
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: readFileSync('resources/testing-docs/testing-guidelines-long.md')
    }]
  })
);

export const testcaseResource = async (server: McpServer) => server.resource(
  'testcase',
  new ResourceTemplate(
    'testcase://projects/{project}/test-cases/{id}',
    {list: undefined}
  ),
  {
    description: 'Ресурс предоставляет запрошенный тесткейс в формате текстового описания, для переданного проекта и id кейса',
    mimeType: 'text/plain'
  },
  async (uri, {project, id}) => ({
    contents: [{
      uri: uri.href,
      text: await getTestCase(
        project instanceof Array ? project[0] : project,
        id instanceof Array ? id[0] : id
      )
    }]
  })
);

/**
 * TODO: Разобраться с пагинацией
 * Отваливаются некоторые клиенты, из-за огромного списка
 * @param projects
 */
function testcaseResourceList(projects: string[]): ListResourcesCallback {
  const resources: ListResourcesResult['resources'] = [];

  return async () => {
    const totals = await Promise.all(
      projects.map((project) =>
        getTestCasesList(project, {project, limit: 1, sort: '-id'}).then(({items}) => items[0].id)
      )
    );

    for (const [pIdx, project] of projects.entries()) {
      for (const id of range(1, totals[pIdx])) {
        resources.push({
          name: `projects/${project}/test-cases/${id}`,
          uri: `testcase://projects/${project}/test-cases/${id}`,
          mimeType: 'text/plain'
        });
      }
    }

    return {resources};
  };

  function* range(from: number, to: number): Iterable<number> {
    for (let idx = from; idx <= to; idx++) {
      yield idx;
    }
  }
};
