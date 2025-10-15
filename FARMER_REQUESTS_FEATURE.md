# Farmer Request Feature Documentation

## Overview
This feature allows consumers to send requests to farmers for dairy products directly through the platform. Consumers can browse farmers, view their profiles, and send detailed requests with their requirements.

## Frontend Components

### 1. Consumer Dashboard (`/consumer/dashboard`)
- **Location-based farmer discovery**: Uses geolocation to find nearby farmers
- **Farmer cards**: Display farmer information with ratings, distance, and product count
- **Search functionality**: Filter farmers by location and search terms
- **Direct navigation**: Click "View Products" to go to individual farmer pages

### 2. Individual Farmer Page (`/consumer/farmer/[id]`)
- **Farmer profile**: Complete information including contact details, ratings, and farm description
- **Product catalog**: Browse all products offered by the farmer
- **Request functionality**: Send detailed requests to farmers
- **Contact options**: Direct phone call and request form

### 3. Request Dialog Features
- **Product interest**: Specify what products the consumer wants
- **Quantity**: Enter required quantity
- **Preferred time**: When they want delivery/contact
- **Contact method**: Choose between phone, WhatsApp, or email
- **Additional message**: Any special requirements or questions

## Backend API Endpoints

### 1. Get Nearby Farmers
```
GET /api/v1/consumers/nearby-farmers?latitude={lat}&longitude={lng}&radius={km}
```
- Returns farmers within specified radius
- Includes distance calculation using Haversine formula
- Filters only approved farmers

### 2. Get Farmer Details
```
GET /api/v1/consumers/farmer/{farmerId}
```
- Returns complete farmer profile with products
- Includes contact information and farm details

### 3. Send Request to Farmer
```
POST /api/v1/consumers/send-request
Authorization: Bearer {token}
Content-Type: application/json

{
  "farmerId": "123",
  "productInterest": "Fresh milk",
  "quantity": "2 liters",
  "preferredTime": "Morning",
  "contactMethod": "phone",
  "message": "Please deliver fresh milk in the morning"
}
```

## Database Schema

### farmer_requests Table
```sql
CREATE TABLE farmer_requests (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmer_profiles(id),
    consumer_id INTEGER NOT NULL REFERENCES users(id),
    product_interest VARCHAR(255) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    preferred_time VARCHAR(100),
    contact_method VARCHAR(50) DEFAULT 'phone',
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    farmer_response TEXT,
    response_at TIMESTAMP
);
```

### Status Values
- `pending`: Request sent, waiting for farmer response
- `accepted`: Farmer accepted the request
- `rejected`: Farmer rejected the request
- `completed`: Request fulfilled

## User Flow

### Consumer Side
1. **Browse farmers**: Consumer visits dashboard and enables location
2. **View farmer profile**: Click on farmer card to see detailed information
3. **Send request**: Click "Send Request" button to open request form
4. **Fill request details**: Specify products, quantity, timing, and contact preferences
5. **Submit request**: Request is sent to farmer and stored in database
6. **Confirmation**: Success message displayed to consumer

### Farmer Side (Future Implementation)
1. **Receive notification**: Farmer gets notified of new request
2. **View request details**: See consumer requirements and contact info
3. **Respond to request**: Accept, reject, or ask for clarification
4. **Follow up**: Contact consumer directly using preferred method

## Security Features

### Authentication
- All request endpoints require valid JWT token
- Consumer must be logged in to send requests
- Farmer ID validation ensures request goes to valid farmer

### Data Validation
- Required fields validation (farmerId, productInterest, quantity)
- Farmer existence and approval status check
- Consumer existence verification

### Rate Limiting (Recommended)
- Limit number of requests per consumer per day
- Prevent spam requests to farmers
- Implement cooldown period between requests

## Future Enhancements

### 1. Real-time Notifications
- WebSocket integration for instant notifications
- Push notifications for mobile apps
- Email/SMS notifications for farmers

### 2. Request Management
- Farmer dashboard to view and manage requests
- Request history for consumers
- Status tracking and updates

### 3. Advanced Features
- Request templates for common products
- Bulk request functionality
- Request scheduling and recurring orders
- Integration with delivery tracking

### 4. Analytics
- Request success rates
- Popular products and farmers
- Geographic request patterns
- Consumer behavior insights

## Setup Instructions

### 1. Database Migration
```bash
# Run the migration script
node backend/database/migrate_requests.js
```

### 2. Environment Variables
Ensure these are set in your backend:
- Database connection string
- JWT secret key
- Email service credentials (for notifications)

### 3. Frontend Dependencies
The feature uses existing UI components:
- Dialog, Button, Input, Textarea, Label
- Lucide React icons
- Tailwind CSS for styling

## Testing

### Manual Testing
1. **Consumer registration and login**
2. **Location permission and farmer discovery**
3. **Farmer profile viewing**
4. **Request form submission**
5. **Database record verification**

### API Testing
```bash
# Test nearby farmers endpoint
curl "http://localhost:5000/api/v1/consumers/nearby-farmers?latitude=19.0760&longitude=72.8777&radius=10"

# Test send request endpoint
curl -X POST "http://localhost:5000/api/v1/consumers/send-request" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"farmerId":"1","productInterest":"Fresh milk","quantity":"2 liters"}'
```

## Troubleshooting

### Common Issues
1. **Location not working**: Check browser permissions and HTTPS
2. **No farmers found**: Verify farmer data and location coordinates
3. **Request not sending**: Check authentication and network connectivity
4. **Database errors**: Ensure migration ran successfully

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify API endpoints are accessible
3. Check database connection and table existence
4. Validate JWT token and user authentication

## Performance Considerations

### Database Optimization
- Indexes on farmer_id, consumer_id, status, and created_at
- Pagination for large request lists
- Query optimization for location-based searches

### Frontend Optimization
- Lazy loading for farmer images
- Debounced search functionality
- Caching for frequently accessed data

### Scalability
- Consider Redis for session management
- Database connection pooling
- CDN for static assets
- Load balancing for high traffic

