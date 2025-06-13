/// <reference types="cypress" />
// ***********************************************
// Custom commands for PodSum E2E tests
// ***********************************************

// Command to wait for the page to fully load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-testid="navbar"]', { timeout: 10000 }).should('be.visible')
  cy.get('[data-testid="hero"]', { timeout: 10000 }).should('be.visible')
})

// Command to search for podcasts
Cypress.Commands.add('searchPodcasts', (query: string) => {
  cy.get('[data-testid="search-input"]', { timeout: 10000 }).should('be.visible')
  cy.get('[data-testid="search-input"]').clear().type(query)
  cy.get('[data-testid="search-button"]').click()
})

// Command to wait for search results
Cypress.Commands.add('waitForSearchResults', () => {
  cy.get('[data-testid="podcast-list"]', { timeout: 15000 }).should('be.visible')
  cy.get('[data-testid="loading-indicator"]', { timeout: 15000 }).should('not.exist')
})