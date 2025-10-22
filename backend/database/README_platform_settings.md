# Platform Settings Database Setup

## Overview
The platform settings are now stored in a dedicated database table for better management and persistence.

## Setup Instructions

### 1. Create the Platform Settings Table
Run the SQL script to create the table and insert default settings:

```sql
-- Run this SQL script in your PostgreSQL database
\i backend/database/platform_settings_table.sql
```

### 2. Initialize Settings via API (Alternative)
You can also initialize the settings via API call:

```bash
# Make a POST request to initialize settings
curl -X POST http://localhost:4000/api/v1/admin/settings/platform/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Database Schema

### Table: `platform_settings`

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Auto-incrementing ID |
| `setting_key` | VARCHAR(100) UNIQUE | Unique key for the setting |
| `setting_value` | TEXT | The setting value |
| `setting_type` | VARCHAR(20) | Type: 'string', 'number', 'boolean', 'json' |
| `description` | TEXT | Human-readable description |
| `is_public` | BOOLEAN | Whether setting is visible to non-admin users |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## Default Settings

The following settings are created by default:

### Public Settings (visible to all users)
- `platform_name`: "Milkeyway"
- `platform_description`: "Connecting farmers and consumers for fresh dairy products"
- `contact_email`: "admin@milkeyway.com"
- `contact_phone`: "+91-9876543210"
- `support_email`: "support@milkeyway.com"
- `maintenance_mode`: false
- `registration_enabled`: true
- `terms_and_conditions`: "https://milkeyway.com/terms"
- `privacy_policy`: "https://milkeyway.com/privacy"

### Private Settings (admin only)
- `max_farmers`: 1000
- `max_consumers`: 10000
- `farmer_approval_required`: true
- `consumer_verification_required`: false
- `email_notifications_enabled`: true
- `sms_notifications_enabled`: true

## API Endpoints

### Admin Endpoints (Authentication Required)
- `GET /api/v1/admin/settings/platform` - Get all platform settings
- `PUT /api/v1/admin/settings/platform` - Update platform settings
- `POST /api/v1/admin/settings/platform/initialize` - Initialize default settings

### Public Endpoints (No Authentication)
- `GET /api/v1/platform/settings` - Get public platform settings

## Usage Examples

### Get All Settings (Admin)
```javascript
const response = await fetch('/api/v1/admin/settings/platform', {
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  }
});
const data = await response.json();
```

### Get Public Settings (Any User)
```javascript
const response = await fetch('/api/v1/platform/settings');
const data = await response.json();
```

### Update Settings (Admin)
```javascript
const response = await fetch('/api/v1/admin/settings/platform', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  },
  body: JSON.stringify({
    platform_name: 'New Platform Name',
    maintenance_mode: true
  })
});
```

## Benefits

1. **Persistent Storage**: Settings are stored in database, not hardcoded
2. **Type Safety**: Each setting has a defined type (string, number, boolean, json)
3. **Public/Private**: Control which settings are visible to non-admin users
4. **Version Control**: Track when settings were created and updated
5. **Flexibility**: Easy to add new settings without code changes
6. **Performance**: Indexed for fast lookups

## Adding New Settings

To add a new setting, simply insert it into the database:

```sql
INSERT INTO platform_settings (setting_key, setting_value, setting_type, description, is_public)
VALUES ('new_setting', 'default_value', 'string', 'Description of new setting', false);
```

The API will automatically pick up new settings without requiring code changes.
