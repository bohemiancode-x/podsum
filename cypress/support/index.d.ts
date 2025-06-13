/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Wait for the main page to fully load
     */
    waitForPageLoad(): Chainable<void>
    
    /**
     * Search for podcasts with the given query
     * @param query - The search query
     */
    searchPodcasts(query: string): Chainable<void>
    
    /**
     * Wait for search results to load
     */
    waitForSearchResults(): Chainable<void>
  }
}
