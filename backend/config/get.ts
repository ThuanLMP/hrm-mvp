import { api } from "encore.dev/api";
import db from "../db";
import { SystemConfig, ConfigResponse } from "./types";

// Gets all system configurations
export const get = api<void, ConfigResponse>(
  { expose: true, method: "GET", path: "/config" },
  async () => {
    const configs = await db.queryAll<SystemConfig>`
      SELECT id, config_key, config_value, description, created_at, updated_at
      FROM system_config
      ORDER BY config_key
    `;

    return { configs };
  }
);
