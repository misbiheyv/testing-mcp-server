# Comprehensive Testing Guidelines

## Test Structure and Organization

### File Organization
```typescript
test.describe('High-level feature/page. Sub-feature.', () => {
  test.apps('Platform')
  test('yalavka-XXXX: High-level feature/page. Sub-feature. What are we testing?', async ({
    fixtures
  }) => {
    // Data mocks
    
    // Preset usage
    
    // Common locators
    
    // Test steps
    await test.step('Page opening action description', async () => {
      await pageOpeningAction
    })

    await test.step('Action description', async () => {
      await action

      await test.step('Expected result 1 description', async () => {
        await verification1
      })

      await test.step('Verification 2 description', async () => {
        await verification2
      })
    })
  })
})
```

### Naming Conventions
- Test names should follow: `yalavka-xxxx: High-level feature/page. Sub-feature (optional). What are we testing?`
- Organize tests by high-level feature files
- Create separate files for sub-features when needed
- Use descriptive step names in present or past tense

### Test Steps Structure
1. First step must be page opening
2. All test case action steps must be present in test
3. Additional steps can be added for proper test implementation
4. Expected results should be nested within action steps
5. All actions must be wrapped in test.step() with descriptions
6. All verifications must be wrapped in test.step() and nested within action steps

## Test Implementation Guidelines

### Prerequisites
- Don't use beforeEach for test group preconditions
- Duplicate common preconditions in each test for clarity
- Use test.apps('platform') decorator for platform specification

### Step Implementation
1. Wrap all actions in test.step() with clear descriptions
2. Nest verification steps within action steps
3. Use present or past tense for step descriptions
4. Keep steps focused and atomic

### Test Parameters and Decorators

#### Contextual Decorators

1. **App Selection** (`test.apps`)
   ```typescript
   // Run test for specific apps
   test.apps(['lavka', 'deli'])
   test('yalavka-1234: Feature test', async () => {
     // Runs for lavka-ios, lavka-android, deli-ios, deli-android
   })

   // Run for single app
   test.apps('lavka-ios')
   test('yalavka-1234: Feature test', async () => {
     // Runs only for lavka-ios
   })
   ```

2. **User Configuration** (`test.user`)
   ```typescript
   // Use specific user
   test.user('alice-1')
   test('yalavka-1234: Feature test', async () => {
     // Authenticated as yndx-l-alice-1
   })

   // Use random user
   test.user({random: true})
   test('yalavka-1234: Feature test', async () => {
     // Authenticated as random user
   })
   ```

3. **Test Parameters** (`test.useFor`)
   ```typescript
   // Apply settings for specific test
   test.useFor({
     colorScheme: 'dark',
     locale: 'fr-FR',
     user: {
       login: 'alice-1'
     }
   })
   test('yalavka-1234: Feature test', async () => {
     // Test runs with dark theme, French locale, and specific user
   })
   ```

#### Test Labels

Available labels:
- `@slow` - Increases test timeout by 3x
- `@skip` - Test will be skipped
- `@fixme` - Test marked as broken and will be skipped
- `@video` - Video recording will be attached to test results
- `@analytics` - Marks analytics-related tests

Usage example:
```typescript
test.describe('Feature', () => {
  test('Test name @slow @video', async ({ app }) => {
    // Test with increased timeout and video recording
  })
})
```

Labels can be combined (e.g., `@lavka @m15 @ios @slow`) and don't affect snapshot hashes or test login bindings.

## Data Mocking

### When to Mock
- Mock data that is:
  - Difficult to reproduce
  - Unstable
  - Missing in testing environment
- Mock features not 100% rolled out
- Don't mock entire categories or common items

### Mocking Best Practices
1. Place backend mocks in specs/data section
2. Don't modify existing mocks unless API changes
3. Reuse existing mocks when possible
4. Share common mocks between website and webview in packages/playwright/mocks

### Preset Handling
1. Use existing presets when possible
2. Create new presets only for potentially reusable logic
3. Avoid presets that simply pass response body
4. Make presets "useful" with parameter-dependent logic
5. Modify existing presets carefully

## Locators and Fixtures

### Locator Best Practices
1. Extract common locators to constants
2. Use the built-in locator shortening tool
3. Use specific page-related locators
4. Avoid text-based, DOM-based, or class-based locators
5. Prefer data-testid and data-item-id for new elements

### Built-in Fixtures
- Use built-in fixtures (catalog, cart, checkout, tracking)
- Example:
  ```typescript
  test('...', ({catalog, cart, checkout, tracking}) => {
    await catalog.increase(0)
    await cart.clear()
    await checkout.open()
    await tracking.open(orderId)
  })
  ```

### App Fixture
The app fixture is the primary fixture for interacting with the application. It provides numerous methods for working with the application:

#### Basic Operations
```typescript
test('App fixture example', async ({app}) => {
  // Open application (main page)
  await app.open()

  // Open specific page
  await app.open('checkout')

  // Open specific URL
  await app.openUrl('/category-group/123/category/favorites')
})
```

#### Element Selection
```typescript
test('Element selection', async ({app}) => {
  // Get element by data-testid or data-testid2
  const element = app.getByTestId('search-bar')

  // Get element by id
  const elementById = app.getById('search-bar')

  // Get element by data-id
  const elementByDataId = app.getByDataId('search-bar')

  // Get element by data-item-id
  const elementByItemId = app.getByItemId('search-bar')
})
```

#### Network and Request Handling
```typescript
test('Network operations', async ({app}) => {
  // Wait for specific API request
  const request = await app.waitForRequest('/api/endpoint')

  // Wait for API response and check it
  const response = await app.waitForResponse('/api/endpoint')
  expect(response).toMatchObject({expected: 'data'})

  // Check if API was called
  const hasRequest = app.hasRequest('/api/endpoint')

  // Get number of API calls
  const requestCount = app.getRequestCount('/api/endpoint')
})
```

#### Page Interactions
```typescript
test('Page interactions', async ({app}) => {
  // Scroll to element
  await app.scrollTo('element-testid')

  // Wait for images to load
  await app.waitForLoadImages(app.body)

  // Take and verify screenshot
  await app.toHaveScreenshot('element-testid')

  // Check storage state
  const storageState = await app.storage()
  const value = await app.storageValue('key')
})
```

### Authentication Options

There are four authentication approaches available:

1. **Default Fixed User** (Recommended)
   ```typescript
   test('Test with fixed user', async ({app}) => {
     // Automatically authenticated as yndx-l-<testId>-<app>
   })
   ```

2. **Specific User**
   ```typescript
   // For all tests in group
   test.describe('Test group', () => {
     test.use({user: 'specific-user'})
     
     test('Test case', async ({app}) => {
       // Authenticated as specific-user
     })
   })

   // For single test
   test.user('specific-user')
   test('Test case', async ({app}) => {
     // Authenticated as specific-user
   })
   ```

3. **Random User**
   ```typescript
   // For all tests in group
   test.describe('Test group', () => {
     test.use({user: {random: true}})
     
     test('Test case', async ({app}) => {
       // New random user for each test run
     })
   })

   // For single test
   test.user({random: true})
   test('Test case', async ({app}) => {
     // New random user for this test
   })
   ```

4. **Unauthorized User**
   ```typescript
   // For all tests in group
   test.describe('Test group', () => {
     test.use({user: {unauthorized: true}})
     
     test('Test case', async ({app}) => {
       // No authentication
     })
   })

   // For single test
   test.user({unauthorized: true})
   test('Test case', async ({app}) => {
     // No authentication
   })
   ```

### Catalog Fixture Methods
The catalog fixture provides methods for interacting with product catalogs:

1. `createFromRoot(root?: string | Locator): ProductsModel`
   - Creates an instance for working with catalog above specified element
   - Example:
   ```typescript
   const products = catalog.createFromRoot('my-carousel')
   await products.increase(0)
   ```

2. `increase(idOrIndex: string | number, by?: number, options?: ChangeCountOptions)`
   - Adds or increases product quantity in cart
   - Example:
   ```typescript
   await catalog.increase(0) // by index
   await catalog.increase('product-id', 3) // by ID with quantity
   ```

3. `decrease(idOrIndex: string | number, by?: number, options?: ChangeCountOptions)`
   - Decreases or removes product from cart
   - Example:
   ```typescript
   await catalog.decrease(0)
   await catalog.decrease('product-id', 3)
   ```

4. `openProduct(idOrIndex: string | number)`
   - Opens product card by index or ID
   - Example:
   ```typescript
   await catalog.openProduct(3)
   ```

5. `getProduct(idOrIndex: string | number): Locator`
   - Returns product snippet locator
   - Example:
   ```typescript
   await app.toHaveScreenshot(catalog.getProduct(3), 'Product Snippet')
   ```

6. `add(idOrIndex: string | number)`
   - Adds one unit of product to cart if not already added
   - Example:
   ```typescript
   await catalog.add(0)
   ```

7. `remove(idOrIndex: string | number)`
   - Removes all units of product from cart
   - Example:
   ```typescript
   await catalog.remove('product-id')
   ```

### Cart Fixture Methods
The cart fixture provides methods for working with the shopping cart:

1. `open(options: OpenOptions)`
   - Opens the cart page
   - Example:
   ```typescript
   await cart.open()
   ```

2. `increase(idOrIndex: string | number, by?: number, options?: ChangeCountOptions)`
   - Adds or increases product quantity in cart
   - Example:
   ```typescript
   await cart.increase(0) // by index
   await cart.increase('product-id', 3) // by ID with quantity
   ```

3. `decrease(idOrIndex: string | number, by?: number, options?: ChangeCountOptions)`
   - Decreases or removes product from cart
   - Example:
   ```typescript
   await cart.decrease(0)
   await cart.decrease('product-id', 3)
   ```

4. `openProduct(idOrIndex: string | number)`
   - Opens product card by index or ID
   - Example:
   ```typescript
   await cart.openProduct('product-id')
   ```

5. `getProduct(idOrIndex: string | number): Locator`
   - Returns product snippet locator
   - Example:
   ```typescript
   await app.toHaveScreenshot(cart.getProduct(3), 'Cart Product')
   ```

6. `add(idOrIndex: string | number)`
   - Adds one unit of product to cart
   - Example:
   ```typescript
   await cart.add('product-id')
   ```

7. `remove(idOrIndex: string | number)`
   - Removes all units of product from cart
   - Example:
   ```typescript
   await cart.remove('product-id')
   ```

8. `clear()`
   - Clears entire cart using "Clear Cart" button
   - Example:
   ```typescript
   await cart.clear()
   ```

Cart fixture also provides useful properties:
- `upsale: ProductsModel` - For working with cart upsell products
- `itemsLocator: Locator` - Locator for all cart products
- `clearButtonLocator: Locator` - Locator for "Clear Cart" button

### Checkout Fixture Methods
The checkout fixture provides methods for working with the checkout page:

1. `open(options: OpenOptions)`
   - Opens the checkout page
   - Example:
   ```typescript
   await checkout.open()
   ```

2. `getPaymentMethod(params: { id?: string; type?: string })`
   - Returns payment method locator
   - Example:
   ```typescript
   const sbpLocator = await checkout.getPaymentMethod({type: 'sbp'})
   const cardLocator = await checkout.getPaymentMethod({id: 'card-id'})
   ```

3. `getBlockId(blockId: string)`
   - Returns checkout block by ID (e.g., 'address', 'tips', etc.)
   - Example:
   ```typescript
   const tipsBlock = await checkout.getBlockId('tips')
   await expect(tipsBlock).toBeVisible()
   ```

### Backend Fixture and Presets
The backend fixture allows control over API responses:

1. Simple Schema Usage:
   ```typescript
   await backend.use({
     '/api/endpoint': {
       response: response => {
         response.data = modifiedData
         return response
       }
     }
   })
   ```

2. Preset Creation:
   ```typescript
   const myPreset = createLavkaPreset({
     '/api/endpoint': {
       response: [
         ([data], response) => {
           response.items = data
           return response
         },
         [mockData]
       ]
     }
   })
   ```

3. Preset with Parameters:
   ```typescript
   const parameterizedPreset = createLavkaPreset((param1, param2) => ({
     '/api/endpoint': {
       response: [
         ([p1, p2], response) => {
           // Modify response using parameters
           return response
         },
         [param1, param2]
       ]
     }
   }))
   ```

4. Combining Presets:
   ```typescript
   await backend.use(
     preset1.setup(param1),
     preset2,
     {
       '/api/endpoint': {
         // Additional modifications
       }
     }
   )
   ```

## Screenshots

### Screenshot Guidelines
1. Include at least one screenshot per feature
2. Don't duplicate identical screenshots
3. Focus on feature-specific elements
4. Use appropriate screenshot names
5. Avoid screenshots of temporary elements
6. Hide interfering elements using the hide option
7. Don't screenshot common components unrelated to the feature

### Screenshot Best Practices
- Use offset for element positioning checks
- Handle dynamic elements appropriately
- Consider CI environment differences
- Accept screenshots from CI as source of truth

## Verifications and Assertions

### Verification Rules
1. Don't duplicate verifications
2. Avoid .toHaveText() for volatile text
3. Verify texts against API values
4. Use screenshots for visual verification
5. Don't verify common components
6. Use .toBeVisible() for element presence
7. Use .not.toBeAttached() for element removal
8. Use app.waitForURL() for navigation checks
9. Avoid .waitForTimeout() except for analytics tests

### Best Practices
- Replace multiple verifications with screenshots when appropriate
- Verify calculated values against expected results
- Use appropriate waiting mechanisms
- Combine verifications and screenshots effectively

## Best Practices

### General Guidelines
1. Keep tests independent
2. Use appropriate waiting mechanisms
3. Handle dynamic content properly
4. Maintain clear test structure
5. Follow naming conventions
6. Document complex logic
7. Handle errors gracefully
8. Use appropriate assertions
9. Optimize test performance
10. Regular maintenance and updates

### Performance Considerations
1. Minimize wait times
2. Optimize locator strategies
3. Reuse existing mocks and presets
4. Efficient screenshot usage
5. Proper test isolation

### Maintenance
1. Regular review of flaky tests
2. Update tests with API changes
3. Maintain screenshot accuracy
4. Keep documentation current
5. Regular code cleanup

This documentation serves as a comprehensive guide for writing and maintaining automated tests. It should be regularly updated to reflect new best practices and lessons learned from implementation experience.

## Analytics Testing

### Overview
Analytics testing involves comparing a reference snapshot with events that occurred during the test. The snapshot contains information about triggered events and their data. If the event information during the test differs from the reference snapshot, the test fails.

### Recording Analytics Snapshots
Analytics snapshots are recorded similarly to screenshots using the `--update-snapshots` parameter.

### Example Implementation
```typescript
test.describe('Feature', () => {
  test('yalavka-001: Analytics verification for feature', async ({ analytics, app }) => {
    // Open main page
    await app.open()

    // Subscribe to specific analytics events
    analytics.subscribeEvents(['event1', 'event2'])
    
    // Get element by data-testid
    const button = app.getByTestId('some-button')
    
    // Perform action (e.g., button click)
    await button.click()
    
    // Verify recorded events match reference snapshot
    await analytics.toMatchSnapshot('snapshot-1')

    // Unsubscribe from specific event
    analytics.unsubscribeEvent('event2')

    // Perform additional actions
    await button.click()

    // Verify new snapshot
    await analytics.toMatchSnapshot('snapshot-2')
  })
})
```

## Experiments and Configs

### Experiments

The experiments fixture allows setting experiment values within tests using the `.use()` method:

```typescript
test.describe('Feature', () => {
  test('Test name', async ({ experiments, app }) => {
    await experiments.use({
      'redesign_payments_list': {
        enabled: true
      },
      'gpt_assistant': {
        enabled: true,
        image: '...',
        greetingText: 'Welcome',
        timeout: 5000
      }
    })
    
    // Page now reflects experiment changes
    await app.open()
  })
})
```

### Configs

The configs fixture enables configuration settings within tests using the `.use()` method:

```typescript
test.describe('Feature', () => {
  test('Test name', async ({ configs, app }) => {
    await configs.use({
      'web-tracking-map': {
        enabled: true
      },
      'loyalty-card': {
        brand: 'lebazar',
        validation: {
          onlyDigits: true,
          allowLength: [2, 4, 4, 4]
        }
      }
    })
    
    // Page now reflects config changes
    await app.open()
  })
})
```

### Resetting Experiments/Configs

To enable only specific experiments or configs for a test, use the `reset: true` option to clear all existing values:

```typescript
test.describe('Feature', () => {
  test('Test name', async ({ experiments, app }) => {
    await experiments.use({
      'coffee-steam': {
        enabled: true
      }
    }, {reset: true}) // Using reset: true
    
    // Page now only has the "coffee-steam" experiment enabled
    await app.open()
  })
})
```

Note: The experiments and configs mechanism is based on backend presets, modifying responses from `/typed_experiments` and `/typed_configs` endpoints.
