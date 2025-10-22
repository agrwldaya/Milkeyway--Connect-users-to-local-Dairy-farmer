-- Platform Settings Table
CREATE TABLE IF NOT EXISTS platform_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default platform settings
INSERT INTO platform_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('platform_name', 'Milkeyway', 'string', 'Platform name', true),
('platform_description', 'Connecting farmers and consumers for fresh dairy products', 'string', 'Platform description', true),
('contact_email', 'admin@milkeyway.com', 'string', 'Contact email address', true),
('contact_phone', '+91-9876543210', 'string', 'Contact phone number', true),
('support_email', 'support@milkeyway.com', 'string', 'Support email address', true),
('max_farmers', '1000', 'number', 'Maximum number of farmers allowed', false),
('max_consumers', '10000', 'number', 'Maximum number of consumers allowed', false),
('farmer_approval_required', 'true', 'boolean', 'Require admin approval for new farmers', false),
('consumer_verification_required', 'false', 'boolean', 'Require verification for new consumers', false),
('email_notifications_enabled', 'true', 'boolean', 'Enable email notifications', false),
('sms_notifications_enabled', 'true', 'boolean', 'Enable SMS notifications', false),
('maintenance_mode', 'false', 'boolean', 'Put platform in maintenance mode', true),
('registration_enabled', 'true', 'boolean', 'Allow new user registrations', true),
('terms_and_conditions', 'https://milkeyway.com/terms', 'string', 'Terms and conditions URL', true),
('privacy_policy', 'https://milkeyway.com/privacy', 'string', 'Privacy policy URL', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_public ON platform_settings(is_public);
