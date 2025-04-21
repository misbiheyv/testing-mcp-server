import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {RegisterFn} from '../interface.js';

const createPrompt = (testFilePath: string) => `
В файле ${testFilePath} на месте блока TestBlock необходимо написать тест. Для того, чтобы получить тест-кейсы, используй get_testcase, в параметры подставь соответствующие аргументы из тэга TestBlock.
Документация по платформе тестов, а также правила и рекомендации по написанию находятся на ресурсе testing-docs.
Напиши тесты следуя правилам и код-стайлу. Если необходимо больше информации и контекста, можешь посмотреть как написаны другие тесты в соседних с тестовым файлом директориях. Не изменяй остальные тесты за пределами блока
`;

const generateTestPrompt = (server: McpServer) => server.prompt(
  'test_generation_instruction',
  'Промпт, описывающий инструкцию для создания теста в указанном файле',
  {
    testFilePath: z.string()
  },
  ({testFilePath}) => {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: createPrompt(testFilePath)
          }
        }
      ]
    }
  }
);

export const registerFns: RegisterFn[] = [];