# Closeout QA Automation task

This project contains UI and API automation test cases for the Closeout application photo AI validation workflow.

## Prerequisites

- **Node.js** 18+ and **npm**
- Network access to `https://closeout-r1fe.enetelsolutions.com/`

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create the test images (required for both UI and API tests):

- Place an image of a person **wearing a hardhat** at:
  - `cypress/fixtures/images/hardhat.jpg`
- Place an image of a person **not wearing a hardhat** at:
  - `cypress/fixtures/images/no-hardhat.jpg`

The exact image content does not matter as long as the application’s AI model recognises them correctly.

## Configuration

Core test configuration is in `cypress.config.js`.

Key `env` values:

- **`email` / `password`**: login credentials (preconfigured with the provided assignment credentials).
- **`projectName`**: name of the project to open (default: `Test Project 687`).
- **`siteName`**: name of the site inside the project (default: `Test Site 2`).
- **`apiBaseUrl`**: base URL for API calls (default: `https://closeout-r1.enetelsolutions.com`).
- **`aiValidationEndpoint`**: path for the AI validation API endpoint (default: `/api/ai/validate-photo` — **assumption**, see below).

You can override env values from the CLI, for example:

```bash
npx cypress run --env email=myuser@example.com,password=Secret123
```

## Running the tests

### Open Cypress Test Runner (interactive)

```bash
npm run cypress:open
```

Then select **E2E Testing**, choose a browser, and run:

- `cypress/e2e/ui/ai_validation_ui.cy.js`
- `cypress/e2e/api/ai_validation_api.cy.js`

### Run all tests in headless mode

```bash
npm test
```

or:

```bash
npm run cypress:run
```

## Implemented tests

There are **11 tests** in total:

- **5 UI tests** (`cypress/e2e/ui/ai_validation_ui.cy.js`)
  - Logs in and opens `Test Site 2` workflow.
  - Uploads a **hardhat** photo and expects the AI validation result to be accepted.
  - Uploads a **no-hardhat** photo and expects the AI validation result to be rejected.
  - Uploads a **field-hardhat-off** photo and expects the AI validation result to be rejected.
  - Uploads a **reghat-fsceout** photo and expects the AI validation result to be rejected.
  - Uploads a **reghat** photo and expects the AI validation result to be rejected.
- **6 API tests** (`cypress/e2e/api/ai_validation_api.cy.js`)
  - Authenticates via `POST /regions/oauth2/token` and asserts an `access_token` is returned.
  - Lists placeholders via `POST /control-panel/api/placeholders/photos` for the configured `locationId`/`templateId` using the bearer token.
  - returns 401 Unauthorized for invalid bearer token
  - returns 401 Unauthorized when Authorization header is missing
  - returns 500 error for missing required locationId parameter
  - returns 500 error for invalid locationId format

Overall, this satisfies the requirement of **3 UI tests and 2 API tests**, with one extra UI test as a bonus (the basic navigation/login scenario).

## How the tests work

- **Reusable commands** are implemented in `cypress/support/commands.js`:
  - `cy.login()` – logs in using env credentials and waits for the Control Panel.
  - `cy.navigateToTestSite()` – opens Control Panel, selects `Test Project 687`, then `Test Site 2`.
  - `cy.uploadTestPhoto({ fileName })` – uploads a given image fixture to the test photo placeholder.
  - `cy.waitForAiValidation()` – waits until the AI validation completes by polling for status text instead of using fixed sleeps.
- The UI tests focus on:
  - Login & navigation.
  - Uploading both positive and negative test images.
  - Asserting on visible **status text** such as `accepted`, `rejected`, `pass`, `fail`, `hardhat`, `no hardhat` (case-insensitive and slightly fuzzy to handle minor UI wording differences).
- The API tests:
  - Authenticate via a login endpoint (currently a placeholder, see assumptions) to obtain a bearer token.
  - Post multipart form-data with the photo file to the **AI validation endpoint**.
  - Assert on the returned status/result field, again using accepted/rejected-style wording.

## Assumptions

- **Login API**:
  - The UI authentication uses `POST /regions/oauth2/token` and returns an `access_token` per region.
-  - The API tests use this same OAuth2 endpoint.
- **AI validation API**:
  - Assumed endpoint: `POST ${apiBaseUrl}${aiValidationEndpoint}` where `aiValidationEndpoint` defaults to `/api/ai/validate-photo`.
  - Assumed request: multipart form-data with a `file` field.
  - Assumed response: JSON with `result` or `status` field including wording such as `accepted`, `rejected`, `hardhat`, `no hardhat`, `pass`, `fail`.
  - If your API uses another shape or field names, update the relevant assertions.
- **UI selectors & texts**:
  - The tests intentionally rely mostly on **text-based selectors** (`cy.contains`) instead of brittle CSS/DOM selectors.
  - They look for:
    - A sign-in form containing text like `Sign in`.
    - A `Control Panel` entry after login.
    - Rows or links by project and site names.
    - Buttons or labels containing `Upload photo`.
    - Status messages containing `accepted`, `rejected`, `validating`, `processing`, `hardhat`, or `no hardhat`.
  - If actual texts differ slightly, tweak the `cy.contains` matchers in `commands.ts` and `ai_validation_ui.cy.ts`.

## Environment / data cleanup limitations

- The photo workflow placeholder for `Test Project 687` / `Test Site 2` (`locationId=7961`, `templateId=121043`) exposes a read API:
  - `POST /control-panel/api/placeholders/photos` with a bearer token from `/regions/oauth2/token` correctly returns existing photos.
- However, attempts to delete uploaded photos using obvious REST candidates (with a valid bearer token) consistently fail with `404`:
  - `DELETE /control-panel/api/placeholders/photos/{placeholderId}`
  - `DELETE /control-panel/api/placeholders/photos/{placeholderId}/document`
  - `DELETE /control-panel/api/documents/{documentId}`
- Because no working delete/cleanup endpoint is exposed on this environment, the test suite **cannot automatically reset photo state** between runs.
- **Implication for running tests**:
  - The happy‑path and negative UI tests for AI validation assume the placeholder starts empty.
  - If photos are already present from a previous run, the behaviour of the workflow (and therefore the assertions) may differ.
  - For repeated runs, test data may need to be reset manually (or on a separate environment / placeholder) to guarantee a clean state.

## Waiting strategy

The tests avoid fixed `cy.wait()` sleeps.
Instead, they:
Wait for specific elements or texts to appear using `cy.contains(..., { timeout: ... })`.
Wait for "validating/processing" text to disappear before checking for final status.
This makes the tests more stable and better aligned with real application behaviour.

  - Permission/role-based access to the Control Panel or AI validation feature.
- Extract page objects for login/control-panel/pages for even more structured test code.
