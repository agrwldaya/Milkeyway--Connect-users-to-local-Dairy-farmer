# Location-Based Consumer Features

## Overview
This implementation adds location-based farmer discovery functionality for consumers in the dairy project. Consumers can now find nearby farmers based on their GPS location and browse their products.

## Features Implemented

### Backend API Endpoints

1. **GET /api/v1/consumers/nearby-farmers**
   - Parameters: `latitude`, `longitude`, `radius` (optional, default: 10km)
   - Returns: List of farmers within the specified radius
   - Uses Haversine formula for accurate distance calculation

2. **GET /api/v1/consumers/farmer/:farmerId**
   - Returns: Detailed farmer information with their products
   - Includes farmer profile, contact info, and all active products

### Frontend Features

1. **Location Request**
   - Automatic location permission request when consumer visits dashboard
   - Graceful fallback for denied permissions
   - Error handling for location access issues

2. **Dynamic Farmer Discovery**
   - Real-time farmer search based on user location
   - Distance calculation and display
   - Expandable search radius (10km → 20km)

3. **Enhanced UI Components**
   - Location permission prompts
   - Loading states during location fetch
   - Error states with retry options
   - Real-time farmer count display

## Technical Implementation

### Database Queries
- Uses PostgreSQL with Haversine formula for accurate distance calculation
- Joins farmer_profiles, users, and products tables
- Filters by active status and location availability

### Frontend State Management
- React hooks for location state management
- Geolocation API integration
- Error handling and loading states
- Permission state tracking

### API Integration
- Next.js API rewrites for backend communication
- Fetch API for HTTP requests
- Error handling and response parsing

## Usage

1. **Consumer Dashboard** (`/consumer/dashboard`)
   - Requests location permission on first visit
   - Shows nearby farmers based on location
   - Displays farmer count and distance

2. **Farmers Page** (`/consumer/farmers`)
   - Dedicated page for browsing all farmers
   - Location-based filtering
   - Search and filter functionality

3. **Individual Farmer Page** (`/consumer/farmer/[id]`)
   - Detailed farmer profile
   - Product listings
   - Contact information
   - Reviews and ratings

## Configuration

### Backend
- Ensure PostgreSQL database is running
- Backend server should be on port 4000
- CORS configured for frontend communication

### Frontend
- Next.js API rewrites configured in `next.config.mjs`
- Backend URL: `http://localhost:4000`
- Location permissions handled by browser

## Security Considerations

- Location data is only used for farmer discovery
- No persistent storage of user location
- HTTPS required for geolocation in production
- CORS properly configured for API access

## Future Enhancements

- Map integration for visual farmer locations
- Advanced filtering (by product type, rating, etc.)
- Delivery radius visualization
- Push notifications for nearby farmers
- Offline location caching
