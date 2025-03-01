"use server";

import * as Sentry from "@sentry/nextjs";

export async function initErrorTracking() {
  try {
    if (!process.env.SENTRY_DSN) {
      console.warn('Sentry DSN not configured, error tracking disabled');
      return;
    }

    await Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: process.env.NODE_ENV === "development",
      environment: process.env.NODE_ENV,
      enabled: process.env.NODE_ENV !== "test"
    });
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

export async function captureError(error: Error, context?: Record<string, any>) {
  try {
    if (!error) return;
    
    console.error("Error captured:", error);
    
    if (process.env.NODE_ENV === "development") {
      console.debug('Error context:', context);
    }

    await Sentry.captureException(error, { extra: context });
  } catch (err) {
    console.error('Failed to capture error:', err);
  }
}

export async function captureMessage(message: string, context?: Record<string, any>) {
  try {
    if (!message) return;
    
    console.log("Message captured:", message);
    
    if (process.env.NODE_ENV === "development") {
      console.debug('Message context:', context);
    }

    await Sentry.captureMessage(message, { extra: context });
  } catch (err) {
    console.error('Failed to capture message:', err);
  }
}

