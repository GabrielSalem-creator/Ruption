import postgres from "postgres";
import { appConfig } from "@/lib/env";

let sqlInstance: postgres.Sql | null = null;

export function getSql() {
  if (!appConfig.databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!sqlInstance) {
    sqlInstance = postgres(appConfig.databaseUrl, {
      ssl: "require",
      max: 1,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false,
    });
  }

  return sqlInstance;
}
