const environments: { [key: string]: string[] } = {
  PROD: [],
  PREPROD: [],
  STAGING: ['CKI', 'WLI'],
  DEV: ['CKI', 'WLI'],
}

// eslint-disable-next-line import/prefer-default-export
export const ACTIVE_AGENCIES: readonly string[] = environments[process.env.ENVIRONMENT_NAME] || []
