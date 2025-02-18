# Comprehensive Testing Guidelines

## Test Structure and Organization

### File Organization

Tests should be organized into files based on high-level features.  Sub-features can be included within the same file or separated into their own files as needed.  Follow this structure:

```typescript
test.describe('High-level feature/page. Sub-feature.', () => {
  test.apps('Platform')
  test('yalavka-XXXX: High-level feature/page. Sub-feature. What are we testing?', async ({ fixtures }) => {
    // Data mocks (if needed)
    // Preset usage (if needed)
    // Common locators (if needed)

    // Test steps (each action and verification should be a separate step)
    await test.step('Page opening action description', async () => {
      await pageOpeningAction;
    });

    await test.step('Action description', async () => {
      await action;

      await test.step('Expected result 1 description', async () => {
        await verification1;
      });

      await test.step('Verification 2 description', async () => {
        await verification2;
      });
    });
  });
});
```

### Naming Conventions

Test names should follow this format:  `yalavka-XXXX: High-level feature/page. Sub-feature (optional). What are we testing?`  Use descriptive names that clearly indicate the purpose of the test.

### Test Step Structure

Each test should consist of a series of atomic steps.  The first step should always be opening the relevant page.  All actions and their corresponding verifications should be clearly defined within separate `test.step()` calls.  Nest verifications within their associated actions. Use present or past tense consistently for step descriptions.


## Test Implementation Guidelines

### Prerequisites

*   Use the `test.apps('platform')` decorator to specify the target platform(s).
*   Duplicate common preconditions within each test for clarity and maintainability. Avoid using `beforeEach` for test group preconditions.

### Step Implementation

*   Wrap all actions and verifications in `test.step()` with clear, concise descriptions.
*   Nest verification steps within their corresponding action steps.
*   Use consistent tense (present or past) for step descriptions.
*   Keep steps focused and atomic (one action or verification per step).


## Test Parameters and Decorators

These decorators provide context and configuration for your tests:

### Contextual Decorators

1.  **App Selection (`test.apps`)**: Specifies the app(s) the test should run on.

    ```typescript
    // Run test for specific apps
    test.apps(['lavka', 'deli']);
    test('yalavka-1234: Feature test', async () => {
      // Runs for lavka-ios, lavka-android, deli-ios, deli-android
    });

    // Run for a single app
    test.apps('lavka-ios');
    test('yalavka-1234: Feature test', async () => {
      // Runs only for lavka-ios
    });
    ```

2.  **User Configuration (`test.user`)**: Specifies the user for authentication.

    ```typescript
    // Use a specific user
    test.user('alice-1');
    test('yalavka-1234: Feature test', async () => {
      // Authenticated as yndx-l-alice-1
    });

    // Use a random user
    test.user({ random: true });
    test('yalavka-1234: Feature test', async () => {
      // Authenticated as a random user
    });
    ```

3.  **Test Parameters (`test.useFor`)**: Applies settings for a specific test.

    ```typescript
    // Apply settings for a specific test
    test.useFor({
      colorScheme: 'dark',
      locale: 'fr-FR',
      user: {
        login: 'alice-1'
      }
    });
    test('yalavka-1234: Feature test', async () => {
      // Test runs with dark theme, French locale, and specific user
    });
    ```

### Test Labels

Use these labels to provide additional metadata to your tests:

*   `@slow`: Increases test timeout by 3x.
*   `@skip`: Skips the test.
*   `@fixme`: Marks a broken test (will be skipped).
*   `@video`: Records a video of the test execution.
*   `@analytics`: Marks analytics-related tests.

Example:

```typescript
test.describe('Feature', () => {
  test('Test name @slow @video', async ({ app }) => {
    // Test with increased timeout and video recording
  });
});
```

Labels can be combined (e.g., `@lavka @m15 @ios @slow`) and don't affect snapshot hashes or test login bindings.


## Data Mocking

### When to Mock

Mock data that is:

*   Difficult to reproduce consistently.
*   Unstable or subject to frequent changes.
*   Missing in the testing environment.
*   Representing features not yet fully rolled out.

Avoid mocking entire categories or common items unless absolutely necessary.

### Mocking Best Practices

1.  Place backend mocks in the `specs/data` directory.
2.  Only modify existing mocks when the API changes.
3.  Reuse existing mocks whenever possible.
4.  Share common mocks between website and webview in `packages/playwright/mocks`.


## Preset Handling

1.  Use existing presets whenever possible.
2.  Create new presets only for potentially reusable logic.
3.  Avoid presets that simply pass the response body; aim for presets with parameter-dependent logic.
4.  Modify existing presets carefully, ensuring backward compatibility.


## Locators and Fixtures

### Locator Best Practices

1.  Extract common locators to constants for reusability and maintainability.
2.  Use the built-in locator shortening tool to improve readability.
3.  Use specific, page-related locators whenever possible.
4.  Avoid text-based, DOM-based, or class-based locators.
5.  Prefer using `data-testid` and `data-item-id` attributes for new elements.


### Built-in Fixtures

Utilize the built-in fixtures (catalog, cart, checkout, tracking) for efficient interaction with application components.  Example:

```typescript
test('...', ({ catalog, cart, checkout, tracking }) => {
  await catalog.increase(0);
  await cart.clear();
  await checkout.open();
  await tracking.open(orderId);
});
```

### App Fixture

The `app` fixture provides methods for interacting with the application:

#### Basic Operations

```typescript
test('App fixture example', async ({ app }) => {
  // Open application (main page)
  await app.open();

  // Open specific page
  await app.open('checkout');

  // Open specific URL
  await app.openUrl('/category-group/123/category/favorites');
});
```

#### Element Selection

```typescript
test('Element selection', async ({ app }) => {
  // Get element by data-testid or data-testid2
  const element = app.getByTestId('search-bar');

  // Get element by id
  const elementById = app.getById('search-bar');

  // Get element by data-id
  const elementByDataId = app.getByDataId('search-bar');

  // Get element by data-item-id
  const elementByItemId = app.getByItemId('search-bar');
});
```

#### Network and Request Handling

```typescript
test('Network operations', async ({ app }) => {
  // Wait for specific API request
  const request = await app.waitForRequest('/api/endpoint');

  // Wait for API response and check it
  const response = await app.waitForResponse('/api/endpoint');
  expect(response).toMatchObject({ expected: 'data' });

  // Check if API was called
  const hasRequest = app.hasRequest('/api/endpoint');

  // Get number of API calls
  const requestCount = app.getRequestCount('/api/endpoint');
});
```

#### Page Interactions

```typescript
test('Page interactions', async ({ app }) => {
  // Scroll to element
  await app.scrollTo('element-testid');

  // Wait for images to load
  await app.waitForLoadImages(app.body);

  // Take and verify screenshot
  await app.toHaveScreenshot('element-testid');

  // Check storage state
  const storageState = await app.storage();
  const value = await app.storageValue('key');
});
```

### Authentication Options

1.  **Default Fixed User (Recommended)**:  Automatically authenticated as `yndx-l-<testId>-<app>`.

2.  **Specific User**: Use `test.user('specific-user')` to authenticate as a specific user for a test or test group.

3.  **Random User**: Use `test.user({ random: true })` to authenticate as a different random user for each test run or for a specific test.

4.  **Unauthorized User**: Use `test.user({ unauthorized: true })` to run tests without authentication.


### Catalog Fixture Methods

See detailed descriptions above.

### Cart Fixture Methods

See detailed descriptions above.

### Checkout Fixture Methods

See detailed descriptions above.

### Backend Fixture and Presets

The `backend` fixture allows controlling API responses using presets or custom handlers.  See detailed descriptions above.


## Screenshots

### Screenshot Guidelines

1.  Include at least one screenshot per feature.
2.  Avoid duplicate screenshots.
3.  Focus on feature-specific elements.
4.  Use descriptive screenshot names.
5.  Avoid screenshots of temporary elements.
6.  Hide interfering elements using the `hide` option when necessary.
7.  Avoid screenshots of common components unrelated to the feature.

### Screenshot Best Practices

*   Use offset for element positioning checks.
*   Handle dynamic elements appropriately.
*   Consider CI environment differences.
*   Accept screenshots from CI as the source of truth.


## Verifications and Assertions

### Verification Rules

1.  Avoid redundant verifications.
2.  Avoid `.toHaveText()` for volatile text; verify against API values instead.
3.  Use screenshots for visual verification when appropriate.
4.  Avoid verifying common components.
5.  Use `.toBeVisible()` for element presence checks.
6.  Use `.not.toBeAttached()` for element removal checks.
7.  Use `app.waitForURL()` for navigation checks.
8.  Avoid `.waitForTimeout()` except for analytics tests.

### Best Practices

*   Replace multiple verifications with screenshots when appropriate.
*   Verify calculated values against expected results.
*   Use appropriate waiting mechanisms.
*   Combine verifications and screenshots effectively.


## Best Practices

### General Guidelines

1.  Keep tests independent and avoid shared state.
2.  Use appropriate waiting mechanisms to handle asynchronous operations.
3.  Handle dynamic content gracefully.
4.  Maintain a clear and consistent test structure.
5.  Follow naming conventions consistently.
6.  Document complex logic clearly.
7.  Handle errors gracefully and provide informative error messages.
8.  Use appropriate assertions to verify expected outcomes.
9.  Optimize test performance for faster execution.
10. Regularly maintain and update tests to reflect changes in the application.

### Performance Considerations

1.  Minimize wait times by using appropriate waiting mechanisms.
2.  Optimize locator strategies for efficient element selection.
3.  Reuse existing mocks and presets to avoid redundancy.
4.  Use screenshots efficiently, focusing on key elements.
5.  Ensure proper test isolation to prevent interference between tests.

### Maintenance

1.  Regularly review and address flaky tests.
2.  Update tests to reflect API changes and application updates.
3.  Maintain the accuracy of screenshots.
4.  Keep documentation current and up-to-date.
5.  Regularly perform code cleanup to improve readability and maintainability.


## Analytics Testing

Analytics testing involves comparing a reference snapshot with events that occurred during the test. The snapshot contains information about triggered events and their data. If the event information during the test differs from the reference snapshot, the test fails.  Analytics snapshots are recorded similarly to screenshots using the `--update-snapshots` parameter.

Example:

```typescript
test.describe('Feature', () => {
  test('yalavka-001: Analytics verification for feature', async ({ analytics, app }) => {
    // Open main page
    await app.open();

    // Subscribe to specific analytics events
    analytics.subscribeEvents(['event1', 'event2']);

    // Get element by data-testid
    const button = app.getByTestId('some-button');

    // Perform action (e.g., button click)
    await button.click();

    // Verify recorded events match reference snapshot
    await analytics.toMatchSnapshot('snapshot-1');

    // Unsubscribe from specific event
    analytics.unsubscribeEvent('event2');

    // Perform additional actions
    await button.click();

    // Verify new snapshot
    await analytics.toMatchSnapshot('snapshot-2');
  });
});
```

## Experiments and Configs

The `experiments` and `configs` fixtures allow setting experiment values and configuration settings within tests.  See detailed descriptions above.  To enable only specific experiments or configs for a test, use the `reset: true` option to clear all existing values.
