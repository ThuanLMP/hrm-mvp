export interface SystemConfig {
  id: number;
  config_key: string;
  config_value: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateConfigRequest {
  config_key: string;
  config_value: string;
}

export interface ConfigResponse {
  configs: SystemConfig[];
}
