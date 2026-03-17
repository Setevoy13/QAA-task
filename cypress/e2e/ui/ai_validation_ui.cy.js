describe("AI photo validation - UI flow", () => {
  const hardHatImage = "hardhat.jpg";
  const noHardhatImage = "no-hardhat.jpg";
  const regHatImage = "reghat.jpg";
  const regHatFaceOutImage = "reghat-faceout.jpg";
  const hardHatOff = "field-hardhat-off.jpg";

  beforeEach(() => {
    cy.login();
    cy.navigateToTestSite();
  });

  it("logs in and opens Test Site workflow", () => {
    cy.url().should("include", "/control-panel");
    cy.get(Cypress.env("headerContainer")).should("be.visible");

    //Find workflow node with name "test photo".
    cy.contains("span", "test photo", { timeout: 20000 })
      .should("be.visible")
      .closest("tr, .co-list-item-inside")
      .click();
  });

  it("uploads a photo with hardhat and sees accepted result", () => {
    cy.uploadTestPhoto({ fileName: hardHatImage });
    cy.waitForAiValidation();

    cy.contains(/accepted|hardhat detected|pass/i, { timeout: 20000 }).should(
      "be.visible",
    );
  });

  it("uploads a photo without hardhat and sees rejected result", () => {
    cy.uploadTestPhoto({ fileName: noHardhatImage });
    cy.waitForAiValidation();

    cy.contains(/rejected|no hardhat|fail/i, { timeout: 20000 }).should(
      "be.visible",
    );
  });

  it("uploads a photo with regular hat and sees rejected result", () => {
    cy.uploadTestPhoto({ fileName: regHatImage });
    cy.waitForAiValidation();

    cy.contains(/rejected|no hardhat|fail/i, { timeout: 20000 }).should(
      "be.visible",
    );
  });

  it("uploads a photo with regular hat and field face out and sees rejected result", () => {
    cy.uploadTestPhoto({ fileName: regHatFaceOutImage });
    cy.waitForAiValidation();

    cy.contains(/rejected|no hardhat|fail/i, { timeout: 20000 }).should(
      "be.visible",
    );
  });

  it("uploads a photo with field hard hat off and sees rejected result", () => {
    cy.uploadTestPhoto({ fileName: hardHatOff });
    cy.waitForAiValidation();

    cy.contains(/rejected|no hardhat|fail/i, { timeout: 20000 }).should(
      "be.visible",
    );
  });
});
