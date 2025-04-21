import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';

import {getTestCase} from '../../tms/index.js';
import {readFileSync} from '../../fs/index.js';

import type {RegisterFn} from '../interface.js';

/**
 * Промпт для {@link createTestTool}
 */
const createPrompt = (testFilePath: string) => `
В файле ${testFilePath} на месте блока TestBlock необходимо написать тест. Для того, чтобы получить тесткейсы, используй get_testcase, в параметры подставь соответствуюшие аргументы из тэга TestBlock.
Документация по платформе тестов, а также правила и рекомендации по написанию находятся на ресурсе testing-docs.
Напиши тесты следуя правилам и код стайлу. Если необходимо больше информации и контекста, можешь посмотреть как написаны другие тесты в соседних с тестовым файлом директориях. Не изменяй остальные тесты за пределами блока
`;

/**
 * Промпт для {@link generateTestFromTmsTool}
 */
const generateTestFromTmsPrompt = (
  {testcaseContent, file, docs}: {testcaseContent: string, file: string, docs: string}
) => `
Прочитай файл ${file} и напиши тест, следуя шагам из тесткейса:
${testcaseContent}
Перед написанием теста, изучи документацию и стайлгайд по написанию тестов и следуй им:
${docs}
Напиши тесты следуя правилам и код стайлу. Используй русский язык для комментариев и названий тестов и шагов. Названия шагов и теста должны соответствовать указанным в тесткейсе.
Если необходимо больше информации и контекста, можешь посмотреть как написаны другие тесты в соседних директориях.
Не изменяй остальные тесты.
`;

const createTestTool = (server: McpServer) => server.tool(
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

const getTestcaseTool = (server: McpServer) => server.tool(
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

const generateTestFromTmsTool = (server: McpServer) => server.tool(
  'generate_test_from_tms',
  'Генерирует тест в указанном файле по переданному тесткейсу из TMS',
  {
    file: z.string(),
    url: z.string()
  },
  async ({url, file}) => {
    try {
      const {project, id} = /projects\/(?<project>.+)?\/testcases\/(?<id>\d+)?(\/|$)/g.exec(url)?.groups ?? {};
      const testcaseContent = await getTestCase(project, id);
      const docs = readFileSync('resources/testing-docs/testing-guidelines-long.md');

      return {
        content: [{
          type: 'text',
          text: generateTestFromTmsPrompt({docs, testcaseContent, file})
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

export const registerFns: RegisterFn[] = [generateTestFromTmsTool];
