import "./commands";

Cypress.on("uncaught:exception", () => {
  // Prevent unrelated app errors from failing tests by default.
  // Individual tests can assert on errors explicitly if needed.
  return false;
});

