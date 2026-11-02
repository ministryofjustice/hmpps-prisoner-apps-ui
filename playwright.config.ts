import { defineConfig, devices } from '@playwright/test'
import { APP_BASE_URL } from './integration_tests/testConfig'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv'
// dotenv.config({ path: path.resolve(__dirname, '.env') })

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  outputDir: './test_results/playwright/test-output',
  testDir: './integration_tests/specs',
  /* Maximum time one test can run for. (millis) */
  timeout: 3 * 60 * 1000,
  /* Maximum time test suite can run for. (millis) */
  globalTimeout: 60 * 60 * 1000,
  /* Let CI shards balance individual tests; workers remain serial per WireMock instance. */
  fullyParallel: !!process.env.CI,
  /* Ensure tests run consecutively due to inability to share wiremock instance */
  workers: 1,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter:
    process.env.CI && process.env.PLAYWRIGHT_MERGE_REPORTS !== 'true'
      ? [['blob', { outputDir: 'test_results/playwright/blob-report' }]]
      : [
          ['list'],
          ['html', { outputFolder: 'test_results/playwright/report', open: process.env.CI ? 'never' : 'on-failure' }],
          ['junit', { outputFile: 'test_results/playwright/junit.xml' }],
        ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    actionTimeout: 30 /* seconds */ * 1000,
    timezoneId: 'Europe/London',
    launchOptions: { slowMo: 150 },
    screenshot: 'only-on-failure',
    trace: process.env.CI ? 'off' : 'on',
    ...devices['Desktop Chrome'],
    testIdAttribute: 'data-qa',
    baseURL: APP_BASE_URL,
  },

  /* Configure projects */
  projects: [{ name: 'default' }],
})
