# Expense Tracker - Test Suite

This directory contains tests for the Expense Tracker application.

## Running Tests

To run the tests, use:

```bash
bun run test
```

## Test Structure

The tests are organized as follows:

- `expenseService.test.ts`: Tests for CRUD operations on expenses
- `utils/`: Helper utilities for tests
- `setup.ts`: Global setup for tests

## Writing New Tests

When writing new tests:

1. Create a test file with a `.test.ts` extension
2. Use Bun's testing API: `import { describe, it, expect } from 'bun:test'`
3. For testing services that modify state, make sure to clean up after your tests
4. Use the helper utilities in `utils/` where appropriate

## Testing CRUD Operations

The CRUD operation tests verify:

- **Create**: `addExpense()` correctly adds a new expense
- **Read**: `getAllExpenses()` and `getExpenseById()` retrieve the correct data
- **Update**: `updateExpense()` correctly modifies an existing expense
- **Delete**: `deleteExpense()` removes an expense from the collection

Each test follows the pattern:

1. Set up the initial state
2. Perform the operation
3. Verify the results
4. Clean up any test data
