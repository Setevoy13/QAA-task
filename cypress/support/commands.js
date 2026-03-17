/// <reference types="cypress" />

Cypress.Commands.add("login", () => {
  const email = Cypress.env("email");
  const password = Cypress.env("password");

  cy.visit("/");

  // Fill login form directly by input names.
  cy.get("input[name='email'], input#username", { timeout: 20000 })
    .should("be.visible")
    .clear()
    .type(email);

  cy.get("input[name='password'][type='password']", { timeout: 20000 })
    .should("be.visible")
    .clear()
    .type(password, { log: false });

  // Click the submit button.
  cy.get("button[type='submit'], [type='submit']", { timeout: 20000 })
    .filter(":visible")
    .first()
    .click();

  cy.contains("Control Panel", { timeout: 30000 }).should("be.visible");
});

Cypress.Commands.add("navigateToTestSite", () => {
  const projectName = Cypress.env("projectName");
  const siteName = Cypress.env("siteName");

  // Open Control Panel entry in the main menu.
  cy.contains("a,button,div,[role='button']", "Control Panel", {
    timeout: 20000,
  })
    .should("be.visible")
    .click();

  // Project list entries are custom div-based items (not table rows).
  cy.contains(".co-list-item-inside", projectName, { timeout: 20000 })
    .should("be.visible")
    .click();

  // Sites are also rendered as div.co-list-item-inside with inner text.
  cy.contains(".co-list-item-inside", siteName, { timeout: 20000 })
    .should("be.visible")
    .click();

  // We are now on the workflow page; "test photo" node should be visible later.
  cy.get("td.co-list-item", { timeout: 30000 })
    .contains("span", "test photo")
    .should("be.visible");
});

Cypress.Commands.add("uploadTestPhoto", ({ fileName }) => {
  const fixturePath = `images/${fileName}`;

  // 1) Find workflow node with name "test photo".
  cy.contains("span", "test photo", { timeout: 20000 })
    .should("be.visible")
    .closest("tr, .co-list-item-inside")
    .click();

  // 2) After the row is selected, click the Upload icon (jhi-upload-document).
  cy.get("jhi-upload-document img[alt='upload']", { timeout: 10000 })
    .should("be.visible")
    .click();

  // 3) In the opened dialog choose file via hidden input[type=file].
  cy.get(
    "jhi-file-uploader .upload-file-container input[type='file'][accept*='image']",
    { timeout: 10000 },
  )
    .should("exist")
    .selectFile(`cypress/fixtures/${fixturePath}`, { force: true });

  // 4) Click Done to confirm upload.
  cy.contains("button", "Done", { timeout: 10000 })
    .should("be.visible")
    .click();
});

Cypress.Commands.add("waitForAiValidation", () => {
  //This part of validation removed due to the fast AI processing time.
  // cy.contains(/validating|processing/i, { timeout: 30000 }).should(
  //   "be.visible",
  // );

  // cy.contains(/validating|processing/i).should("not.exist");

  // Wait for the validation status element to exist
  cy.contains(/accepted|rejected|failed/i, { timeout: 20000 }).should("exist");

  // Now assert the text is visible
  cy.contains(/accepted|rejected|failed/i).should("be.visible");
});
