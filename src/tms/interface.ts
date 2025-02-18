export interface TestCaseStepBase<T extends string> {
  type: T;
  action: string;
  expectation: string;
  actionHtml?: string;
  expectationHtml?: string;
}

export interface TestCaseStepLocal extends TestCaseStepBase<'local'> {}

export interface TestCaseStepShared extends TestCaseStepBase<'shared'> {
  hash: string;
  version: number;
  sharedStepsGroupId: number;
}

export type TestCaseStep<T extends 'shared' | 'local'> = T extends 'shared' ? TestCaseStepShared : TestCaseStepLocal;

export interface CustomField {
  id: string;
  values: Array<string | number | boolean>;
  version?: number;
  title?: string;
};

export interface PreconditionLocal {
  type: 'local';
  condition: string;
  conditionHtml?:	string;
}

export interface PreconditionShared {
  type: 'shared';
  condition: string;
  title: string;
  version: number;
  sharedConditionId: number;
  conditionHtml?:	string;
}

export type Precondition<T extends 'shared' | 'local'> = T extends 'shared' ? PreconditionShared : PreconditionLocal;

export interface TestCaseResponse {
  isArchived: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
  id: number;
  title: string;
  description: string;
  steps: Array<TestCaseStep<'shared' | 'local'>>;
  timeTracking: {
    estimate: number[];
  };

  priority?:	{
    key: 'critical' | 'high' | 'medium' | 'low';
    order: number;
  };

  status?:	{
    key: 'draft' | 'in_review' | 'actual' | 'need_changes' | 'duplicate' | 'archived';
    order: number;
  };

  customFields?: CustomField[];
  descriptionHtml?: string;
  preconditions?: Array<Precondition<'shared' | 'local'>>;
}

export interface TestCasesListResponse {
  items: TestCaseResponse[];
  limit: number;
  total: number;
  offset: number;
}

export interface TestCasesListQuery {
  project: string;
  limit: number;
  offset?: number;
  sort?: `${'-' | ''}${keyof TestCaseResponse}`;
}
