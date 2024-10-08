// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { ignoreErrors } from "./app/utils/sentry";

Sentry.init({
  dsn: "https://64a866556aabef2a9c47334ab3618680@o4507686426968064.ingest.us.sentry.io/4507686429130752",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
  ignoreErrors: ignoreErrors,

  // Enables capturing all console API calls and redirects them to Sentry using the captureException
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ["error"],
    }),
  ],
});
