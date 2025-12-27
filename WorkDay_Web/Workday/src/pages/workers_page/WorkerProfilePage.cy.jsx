import React from 'react'
import WorkerProfilePage from './WorkerProfilePage'

describe('<WorkerProfilePage />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<WorkerProfilePage />)
  })
})