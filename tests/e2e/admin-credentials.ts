// Basic-auth credentials for the local Playwright server only.
//
// The admin surface runs behind middleware Basic Auth, and `npm run start` puts
// the app in production mode, where missing ADMIN_USERNAME / ADMIN_PASSWORD make
// every protected path unreachable. CI sets no admin secrets, so the Playwright
// web server supplies these test-only values and the specs authenticate with the
// same pair. Real credentials come from the environment when it provides them.
export const adminCredentials = {
  username: process.env.ADMIN_USERNAME ?? "e2e-admin",
  password: process.env.ADMIN_PASSWORD ?? "e2e-local-only",
};
