export const appConfig = {
  appName: "Rupture",
  niche: "AI tools for builders and creators",
  authCookieName: "rupture_session",
  authSecret: process.env.AUTH_SECRET || "dev-only-rupture-secret",
  databaseUrl: process.env.DATABASE_URL,
};

export function hasDatabase() {
  return Boolean(appConfig.databaseUrl);
}
