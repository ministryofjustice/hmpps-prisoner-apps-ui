const wiremockPort = process.env.WIREMOCK_PORT ?? '9091'
const appPort = process.env.PORT ?? '3007'

export const WIREMOCK_BASE_URL = process.env.WIREMOCK_BASE_URL ?? `http://localhost:${wiremockPort}`
export const APP_BASE_URL = process.env.PW_BASE_URL ?? `http://localhost:${appPort}`
export const LAUNCHPAD_AUTH_URL = process.env.LAUNCHPAD_AUTH_URL ?? `${WIREMOCK_BASE_URL}/launchpadauth`