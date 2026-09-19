export function getOpsApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_KEYD_OPS_API_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (typeof window === "undefined") {
    return (
      process.env.KEYD_APP_API_ORIGIN?.replace(/\/$/, "") ||
      "http://localhost:4000"
    );
  }

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:4000";
  }

  // Same-origin proxy on keydtech.com — stable vs flaky *.vercel.app ops project.
  return `${window.location.origin}/keyd-api`;
}

/** @deprecated use getOpsApiUrl() — kept for call sites that expect a constant. */
export const API_URL =
  typeof window === "undefined"
    ? process.env.KEYD_APP_API_ORIGIN?.replace(/\/$/, "") ||
      "http://localhost:4000"
    : getOpsApiUrl();
