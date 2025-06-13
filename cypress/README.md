# E2E Testing with Cypress

This directory contains end-to-end tests for the PodSum application using Cypress.

## Test Structure

- **`e2e/`** - Contains the actual test files
- **`fixtures/`** - Contains test data and mock responses
- **`support/`** - Contains custom commands and configuration

## Running Tests

### Prerequisites
Make sure your development server is running:
```bash
npm run dev
```

### Run Tests Interactively
```bash
npm run cy:open
```

### Run Tests in Headless Mode
```bash
npm run cy:run
```

### Run E2E Tests with Auto Server Management
```bash
# Runs tests and automatically starts/stops the dev server
npm run e2e

# Opens Cypress UI and automatically starts dev server
npm run e2e:open
```

## Test Coverage

The current E2E tests cover:

1. **Page Loading** - Verifies the homepage loads correctly
2. **Hero Section** - Checks hero content and search functionality
3. **Initial Data Loading** - Ensures podcasts load on page visit
4. **Search Functionality** - Tests podcast search feature
5. **Podcast Cards** - Validates podcast card content and structure
6. **Summarization Flow** - Tests the complete AI summarization process
7. **Responsive Design** - Checks mobile viewport functionality
8. **Error Handling** - Tests graceful error handling

## Custom Commands

The following custom Cypress commands are available:

- `cy.waitForPageLoad()` - Waits for the main page components to load
- `cy.searchPodcasts(query)` - Performs a podcast search
- `cy.waitForSearchResults()` - Waits for search results to appear

## Test Data

Test fixtures include:
- Mock podcast data in `fixtures/podcasts.json`
- Sample search queries and expected responses

## Configuration

- **Base URL**: `http://localhost:3000`
- **Viewport**: 1280x720 (desktop), 375x667 (mobile)
- **Timeouts**: Extended timeouts for AI processing (up to 60 seconds)
- **Video Recording**: Disabled for performance
- **Screenshots**: Enabled on failure

## Notes

- Tests include longer timeouts for AI summarization processing
- Network error simulation tests API resilience
- All tests use data-testid attributes for reliable element selection
- Mobile responsiveness is tested across different viewport sizes
