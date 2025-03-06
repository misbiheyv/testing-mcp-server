import {readFileSync, writeFileSafety} from '../fs/index.js';
import {request} from './provider.js';
import type {TestCaseResponse, TestCasesListQuery, TestCasesListResponse} from './interface.js';

export * from './interface.js';

export async function getTestCase(project: string, id: string | number): Promise<string> {
  const uri = `/projects/${project}/test-cases/${id}`;

  try {
    return testCaseFormatter(JSON.parse(readFileSync(uri)), project);
  } catch {
    return request<TestCaseResponse>(uri).then((data) => testCaseFormatter(data, project))
  }
}

export function getTestCasesList(project: string, query: TestCasesListQuery): Promise<TestCasesListResponse> {
  const queryParams = Object.entries(query).reduce((acc, [key, value]) => acc.concat(`${key}=${value}&`), '');

  return request(`/projects/${project}/test-cases?${queryParams}`);
}

export async function cacheAllCases(project: string): Promise<void> {
  const query: TestCasesListQuery = {
    offset: 0,
    limit: 500,
    project,
    sort: 'id'
  };

  let total = Number.MAX_SAFE_INTEGER;

  try {
    while (total > (query.offset ?? 0)) {
      await getTestCasesList(project, query).then((res) => {
        query.offset = res.offset + res.limit;
        total = res.total ?? 0;
        return testCasesSaver(res.items, project);
      })
  
      await sleep(500);
    }
  } catch (error) {

    console.error(error);
  }
}

function testCasesSaver(testCases: TestCaseResponse[], project: string): Promise<unknown> {
  return Promise.all(
    testCases.map((testCase) =>
      writeFileSafety(
        `projects/${project}/test-cases/${testCase.id}`,
        testCase
      )
    )
  );
}

function testCaseFormatter(data: TestCaseResponse, project: string): string {
  const cutRegexp = /(?<cut>{% cut(.|\n)+?{% endcut %})/g;

  const f = {
    steps: (steps: TestCaseResponse['steps']): string => 
      steps.map(
        ({action, expectation}, idx) => expectation
          ? `${idx + 1} step:\n${action}\nExpected result:\n${expectation?.replace(cutRegexp, '')}`.trimEnd()
          : `${idx + 1} Step:\n${action}`.trimEnd()
      ).join('\n\n'),

    preconditions: (preconditions: TestCaseResponse['preconditions']): string | undefined =>
      preconditions?.map(({condition}) => `- ${condition}`).join('\n'),

    title: (testcase: TestCaseResponse, project: string) => `${project}-${testcase.id}. ${testcase.title}`
  };

  return `Title: ${f.title(data, project)}\n` +
    `Description: ${data.description}\n\n` +
    `Preconditions:\n${f.preconditions(data.preconditions)}\n\n` +
    `Steps:\n${f.steps(data.steps)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
