/// <reference types="cypress" />

describe('PodSum E2E Tests', () => {
  beforeEach(() => {
    // Visit the app homepage
    cy.visit('/')
  })

  it('should load the homepage successfully', () => {
    // Check that the page loads with main components
    cy.waitForPageLoad()
    
    // Verify page title
    cy.title().should('include', 'PodSum')
    
    // Check main sections are visible
    cy.get('[data-testid="hero"]').should('be.visible')
    cy.get('[data-testid="podcast-list"]').should('be.visible')
    cy.get('[data-testid="footer"]').should('be.visible')
  })

  it('should display the hero section with search functionality', () => {
    cy.waitForPageLoad()
    
    // Check hero content
    cy.get('[data-testid="hero"]').within(() => {
      cy.contains('AI-Powered Podcast Summaries').should('be.visible')
      cy.get('[data-testid="search-input"]').should('be.visible')
      cy.get('[data-testid="search-button"]').should('be.visible')
    })
  })

  it('should load initial podcasts on page load', () => {
    cy.waitForPageLoad()
    
    // Wait for initial podcast results to load
    cy.get('[data-testid="podcast-list"]', { timeout: 15000 }).should('be.visible')
    
    // Check that some podcasts are displayed
    cy.get('[data-testid^="podcast-card-"]', { timeout: 15000 }).should('have.length.greaterThan', 0)
  })

  it('should be able to search for podcasts', () => {
    cy.waitForPageLoad()
    
    // Search for technology podcasts
    cy.searchPodcasts('technology')
    
    // Wait for search results
    cy.waitForSearchResults()
    
    // Verify search results are displayed
    cy.get('[data-testid^="podcast-card-"]').should('have.length.greaterThan', 0)
  })

  it('should display podcast cards with required information', () => {
    cy.waitForPageLoad()
    cy.waitForSearchResults()
    
    // Check the first podcast card
    cy.get('[data-testid^="podcast-card-"]').first().within(() => {
      // Should have an image
      cy.get('img').should('be.visible')
      
      // Should have a title
      cy.get('[data-testid="podcast-title"]').should('be.visible')
      
      // Should have a description
      cy.get('[data-testid="podcast-description"]').should('be.visible')
      
      // Should have a summarize button
      cy.get('[data-testid="summarize-button"]').should('be.visible')
    })
  })

  it('should handle podcast summarization flow', () => {
    cy.waitForPageLoad()
    cy.waitForSearchResults()
    
    // Click on the first summarize button
    cy.get('[data-testid="summarize-button"]').first().click()
    
    // Should show loading state
    cy.get('[data-testid="loading-steps"]', { timeout: 5000 }).should('be.visible')
    
    // Wait for summary modal to appear (with longer timeout for AI processing)
    cy.get('[data-testid="summary-modal"]', { timeout: 60000 }).should('be.visible')
    
    // Check summary modal content
    cy.get('[data-testid="summary-modal"]').within(() => {
      cy.get('[data-testid="summary-content"]').should('be.visible')
      cy.get('[data-testid="close-modal"]').should('be.visible')
    })
  })

  it('should be responsive on mobile viewport', () => {
    // Set mobile viewport
    cy.viewport(375, 667)
    
    cy.waitForPageLoad()
    
    // Check that components are still visible on mobile
    cy.get('[data-testid="navbar"]').should('be.visible')
    cy.get('[data-testid="hero"]').should('be.visible')
    cy.get('[data-testid="podcast-list"]').should('be.visible')
    
    // Check that search input is accessible
    cy.get('[data-testid="search-input"]').should('be.visible')
  })

  it('should handle network errors gracefully', () => {
    // Intercept API calls and return errors
    cy.intercept('GET', '/api/podcasts/**', { statusCode: 500 }).as('podcastError')
    
    cy.visit('/')
    cy.waitForPageLoad()
    
    // Search to trigger API call
    cy.searchPodcasts('test')
    
    // Should handle error gracefully
    cy.wait('@podcastError')
    
    // Check for error message or fallback UI
    cy.get('body').should('contain.text', 'error')
  })
})
