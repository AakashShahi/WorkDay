import React from 'react'
import WorkerAssignedJobs from './WorkerAssignedJobs'

describe('<WorkerAssignedJobs />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<WorkerAssignedJobs />)
  })
})