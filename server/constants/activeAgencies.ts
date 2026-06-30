const isProd = process.env.NODE_ENV === 'PROD'

// eslint-disable-next-line import/prefer-default-export
export const ACTIVE_AGENCIES: readonly string[] = isProd ? ['RNI'] : ['CKI', 'WLI']
