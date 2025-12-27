describe("Registration Form E2E Test", () => {
    beforeEach(() => {
        // Visit the registration page before each test
        cy.visit("/register");
    });

    it("should allow a new worker to register successfully and be redirected to login", () => {
        // Mock the successful registration API call
        cy.intercept('POST', '**/api/auth/register', {
            statusCode: 201,
            body: {
                success: true,
                message: "User registered successfully. Please login.",
            }
        }).as("successfulRegister");

        // --- Fill out the form with valid data ---
        cy.get('input[name="username"]').type("new_worker_123");
        cy.get('input[name="email"]').type("new.worker@example.com");
        cy.get('input[name="phone"]').type("9812345678");
        cy.get('input[name="password"]').type("ValidPassword123!");
        cy.get('input[name="confirmPassword"]').type("ValidPassword123!");

        // --- Submit the form ---
        cy.get('button[type="submit"]').click();

        // --- Assertions ---
        // Wait for the mocked API call to be made
        cy.wait("@successfulRegister");

        // Check that the user is redirected to the login page (or home page)
        cy.url().should("include", "/"); // The form navigates to "/" which is the login page
    });

    it("should show an error message if the email is already taken", () => {
        // Mock a failed registration API call (409 Conflict)
        cy.intercept('POST', '**/api/auth/register', {
            statusCode: 409,
            body: {
                success: false,
                message: "Email or username already exists."
            }
        }).as("failedRegister");

        // --- Fill out the form with data that "already exists" ---
        cy.get('input[name="username"]').type("existing_user");
        cy.get('input[name="email"]').type("taken@example.com");
        cy.get('input[name="phone"]').type("9800000000");
        cy.get('input[name="password"]').type("Password123!");
        cy.get('input[name="confirmPassword"]').type("Password123!");

        // --- Submit the form ---
        cy.get('button[type="submit"]').click();

        // --- Assertions ---
        // Wait for the API call
        cy.wait("@failedRegister");

        // Check for the error toast message from the API response
        cy.contains("Email or username already exists.").should("be.visible");

        // Ensure the user remains on the register page
        cy.url().should("include", "/register");
    });

    it("should display client-side validation errors for invalid or empty fields", () => {
        // --- Test Case 1: Empty fields ---
        cy.get('button[type="submit"]').click();
        cy.contains("Username required").should("be.visible");
        cy.contains("Email required").should("be.visible");
        cy.contains("Phone number required").should("be.visible");
        cy.contains("Password required").should("be.visible");

        // --- Test Case 2: Mismatched passwords ---
        cy.get('input[name="password"]').type("Password123!");
        cy.get('input[name="confirmPassword"]').type("DifferentPassword123!");
        cy.get('button[type="submit"]').click();
        cy.contains("Passwords must match").should("be.visible");

        // --- Test Case 3: Invalid phone number ---
        cy.get('input[name="phone"]').clear().type("12345");
        cy.get('button[type="submit"]').click();
        cy.contains("Invalid Nepali phone number").should("be.visible");
    });
});