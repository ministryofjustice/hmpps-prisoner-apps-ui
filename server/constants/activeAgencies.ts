const environments: { [key: string]: string[] } = {
  PROD: ['RNI'],
  PREPROD: [],
  STAGING: ['CKI', 'RNI', 'WLI'],
  DEV: ['CKI', 'RNI', 'WLI'],
}

// eslint-disable-next-line import/prefer-default-export
export const ACTIVE_AGENCIES: readonly string[] = environments[process.env.ENVIRONMENT_NAME] || []
