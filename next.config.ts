import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
// @ts-expect-error next-pwa does not provide types natively and using @types/next-pwa is sometimes flaky
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(withPWA(nextConfig), {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  org: "SimbisData",
  project: "SimbisData-web",
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
