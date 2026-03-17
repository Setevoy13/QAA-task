const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://closeout-r1fe.enetelsolutions.com",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx}",
    supportFile: "cypress/support/e2e.js",
    retries: {
      runMode: 1,
      openMode: 0,
    },
    viewportWidth: 1440,
    viewportHeight: 900,
    defaultCommandTimeout: 10000,
    env: {
      email: "pexevih256@devlug.com",
      password: "Closeout!123",
      // API host observed in DevTools Network.
      apiBaseUrl: "https://closeout-r1.enetelsolutions.com",
      aiValidationEndpoint: "/api/ai/validate-photo", // assumption; see README
      projectName: "Test Project 687",
      siteName: "Test Site 2",
      headerContainer: ".font-18",
      photoNodeName: "test photo",
      // IDs observed in the upload request payload.
      locationId: 7961,
      templateId: 121043,
    },
  },
});
