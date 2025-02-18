import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {getTestCase} from '../../tms/index.js';

const createPrompt = (testFilePath: string) => `
В файле ${testFilePath} на месте блока <TestBlock></TestBlock> необходимо написать тест. Для того, чтобы получить тесткейсы, используй get_testcase, в параметры подставь соответствуюшие аргументы из тэга TestBlock.
Документация по платформе тестов, а также правила и рекомендации по написанию находятся на ресурсе testing-docs.
Напиши тесты следуя правилам и код стайлу. Если необходимо больше информации и контекста, можешь посмотреть как написаны другие тесты в соседних с тестовым файлом директориях. Не изменяй остальные тесты за пределами блока
`;

export const createTestTool = (server: McpServer) => server.tool(
  'create_test',
  'Принимает путь до файла, где необходимо написать тест. Возвращает промпт-инструкцию, которой агент будет следовать для дальнейшего написания теста.',
  {
    testFilePath: z.string()
  },
  async ({testFilePath}) => ({
    content: [{
      type: 'text',
      text: createPrompt(testFilePath)
    }]
  })
);

export const getTestcaseTool = (server: McpServer) => server.tool(
  'get_testcase',
  'Принимает путь до тесткейса из TMS. Возвращает запрошенный тесткейс в текстовом формате.',
  {
    path: z.string()
  },
  async ({path}) => {
    try {
      const {project, id} = /projects\/(?<project>.+)?\/testcases\/(?<id>\d+)?(\/|$)/g.exec(path)?.groups ?? {};
      const text = await getTestCase(project, id);

      return {
        content: [{
          type: 'text',
          text
        }]
      };
    } catch (err: unknown) {
      const error = err as Error;

      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);
