describe("Login Form E2E Test", () => {
    beforeEach(() => {
        // Visit the login page before each test
        cy.visit("/login");
    });

    it("should allow a worker to log in successfully and be redirected", () => {
        // Mock the successful login API call for a 'worker'
        cy.intercept('POST', '**/api/auth/login', {
            statusCode: 200,
            body: {
                success: true,
                message: "Login successful",
                data: {
                    token: "fake-worker-token-123",
                    user: {
                        role: "worker",
                        username: "testworker"
                    }
                }
            }
        }).as("workerLogin");

        // --- Fill out the form ---
        cy.get('input[name="identifier"]').type("worker@example.com");
        cy.get('input[name="password"]').type("Password123!");

        // --- Submit the form ---
        cy.get('button[type="submit"]').click();

        // --- Assertions ---
        cy.wait("@workerLogin");

        // Check that the URL has changed to the worker dashboard.
        // NOTE: The test log showed a redirect to '/dashboard'. 
        // If the intended URL is '/worker/dashboard', the application's routing logic may need to be reviewed.
        cy.url().should("include", "/worker/dashboard");
    });
});