import { api, APIError } from "encore.dev/api";
import db from "../db";
import { UpdateConfigRequest, SystemConfig } from "./types";

// Updates a system configuration
export const update = api<UpdateConfigRequest, SystemConfig>(
  { expose: true, method: "PUT", path: "/config" },
  async (req) => {
    // Check if config exists
    const existingConfig = await db.queryRow`
      SELECT id FROM system_config WHERE config_key = ${req.config_key}
    `;

    if (!existingConfig) {
      throw APIError.notFound("Không tìm thấy cấu hình");
    }

    // Update configuration
    const config = await db.queryRow<SystemConfig>`
      UPDATE system_config 
      SET config_value = ${req.config_value}, updated_at = CURRENT_TIMESTAMP
      WHERE config_key = ${req.config_key}
      RETURNING id, config_key, config_value, description, created_at, updated_at
    `;

    if (!config) {
      throw APIError.internal("Không thể cập nhật cấu hình");
    }

    return config;
  }
);
