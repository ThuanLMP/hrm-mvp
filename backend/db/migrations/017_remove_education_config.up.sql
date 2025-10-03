-- Remove education_levels from system_config since we now use enum values
DELETE FROM system_config WHERE config_key = 'education_levels';
