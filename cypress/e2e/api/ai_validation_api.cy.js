describe("Closeout API - auth and placeholders", () => {
  const apiBaseUrl = Cypress.env("apiBaseUrl");
  const locationId = Cypress.env("locationId");
  const templateId = Cypress.env("templateId");

  function getAccessToken() {
    const email = Cypress.env("email");
    const password = Cypress.env("password");

    return cy
      .request({
        method: "POST",
        url: `${apiBaseUrl}/regions/oauth2/token`,
        body: {
          username: email,
          password,
          deviceId: "cypress-device-id",
        },
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("array").and.not.be.empty;

        const region = response.body[0];
        expect(region).to.have.property("base_uri");
        expect(region).to.have.property("tokens");
        expect(region.tokens).to.be.an("array").and.not.be.empty;

        const token = region.tokens[0].access_token;
        expect(token, "access_token").to.be.a("string").and.not.be.empty;
        return token;
      });
  }

  it("authenticates via /regions/oauth2/token and returns an access_token", () => {
    getAccessToken().then((token) => {
      // Minimal assertion to prove we can log in and use the token.
      expect(token).to.match(/^eyJ/);
    });
  });

  it("lists placeholders for test photo node (locationId/templateId) with bearer token", () => {
    getAccessToken().then((token) => {
      cy.request({
        method: "POST",
        url: `${apiBaseUrl}/control-panel/api/placeholders/photos`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          order: "status_asc",
          statuses: ["accepted", "rejected", "not-needed", "initial"],
          locationId,
          templateId,
          imageSize: "LARGE",
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("array");

        // If there are items, validate the schema of the first entry.
        if (res.body.length > 0) {
          const item = res.body[0];
          expect(item).to.have.property("id");
          expect(item).to.have.property("locationId", locationId);
          expect(item).to.have.property("templateId", templateId);
          expect(item).to.have.property("documentId");
          expect(item).to.have.property("placeholderStatus");
          expect(item.placeholderStatus).to.have.property("name");
        }
      });
    });
  });

  // Negative scenario tests
  it("returns 401 Unauthorized for invalid bearer token", () => {
    cy.request({
      method: "POST",
      url: `${apiBaseUrl}/control-panel/api/placeholders/photos`,
      headers: {
        Authorization: "Bearer invalid_token_123",
      },
      failOnStatusCode: false,
      body: {
        order: "status_asc",
        statuses: ["accepted", "rejected", "not-needed", "initial"],
        locationId,
        templateId,
      },
    }).then((res) => {
      expect(res.status).to.eq(401);
      // Body may be null for 401, so only check if it exists
      if (res.body) {
        expect(res.body).to.satisfy(
          (body) => body.error || body.message,
          "Response should contain error or message",
        );
      }
    });
  });

  it("returns 401 Unauthorized when Authorization header is missing", () => {
    cy.request({
      method: "POST",
      url: `${apiBaseUrl}/control-panel/api/placeholders/photos`,
      failOnStatusCode: false,
      body: {
        order: "status_asc",
        statuses: ["accepted", "rejected", "not-needed", "initial"],
        locationId,
        templateId,
      },
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("returns 500 error for missing required locationId parameter", () => {
    getAccessToken().then((token) => {
      cy.request({
        method: "POST",
        url: `${apiBaseUrl}/control-panel/api/placeholders/photos`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        failOnStatusCode: false,
        body: {
          order: "status_asc",
          statuses: ["accepted", "rejected", "not-needed", "initial"],
          templateId,
        },
      }).then((res) => {
        expect(res.status).to.eq(500);
      });
    });
  });

  it("returns 500 error for invalid locationId format", () => {
    getAccessToken().then((token) => {
      cy.request({
        method: "POST",
        url: `${apiBaseUrl}/control-panel/api/placeholders/photos`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        failOnStatusCode: false,
        body: {
          order: "status_asc",
          statuses: ["accepted", "rejected", "not-needed", "initial"],
          locationId: "invalid-id",
          templateId,
        },
      }).then((res) => {
        expect(res.status).to.eq(500);
      });
    });
  });
});
