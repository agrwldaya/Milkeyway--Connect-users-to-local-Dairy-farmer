# Review System Implementation

This document provides a comprehensive overview of the review system implemented in the Dairy Project.

## 🎯 Overview

The review system allows consumers to rate and review farmers after establishing connections, providing valuable feedback and building trust in the platform.

## 🗄️ Database Schema

### New Tables Created

#### 1. `farmer_reviews` - Main reviews table
```sql
CREATE TABLE farmer_reviews (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    active_connection_id INTEGER REFERENCES active_connections(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(255),
    review_text TEXT,
    product_quality_rating INTEGER CHECK (product_quality_rating >= 1 AND product_quality_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    value_for_money_rating INTEGER CHECK (value_for_money_rating >= 1 AND value_for_money_rating <= 5),
    is_verified_purchase BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false,
    review_status VARCHAR(20) DEFAULT 'active' CHECK (review_status IN ('active', 'hidden', 'reported', 'deleted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(consumer_id, farmer_id)
);
```

#### 2. `farmer_review_responses` - Farmer responses to reviews
```sql
CREATE TABLE farmer_review_responses (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES farmer_reviews(id) ON DELETE CASCADE,
    farmer_id INTEGER NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `review_helpfulness` - Review helpfulness voting
```sql
CREATE TABLE review_helpfulness (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES farmer_reviews(id) ON DELETE CASCADE,
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, consumer_id)
);
```

### Enhanced Existing Tables

#### `farmer_profiles` - Added rating columns
- `average_rating` - Quick access to farmer's average rating
- `total_reviews` - Total number of reviews received
- `rating_distribution` - JSON object showing count of each star rating
- `last_review_at` - Timestamp of most recent review

#### `farmer_activity_summary` - Added review metrics
- `total_reviews_received` - Total number of reviews received
- `average_rating_received` - Average rating received
- `positive_reviews_count` - Number of reviews with rating 4 or 5
- `negative_reviews_count` - Number of reviews with rating 1 or 2
- `review_response_rate` - Percentage of reviews that farmer has responded to

## 🔧 Backend Implementation

### API Endpoints

#### Review Management
- `POST /api/v1/reviews` - Add a new review
- `GET /api/v1/reviews/farmer/:farmerId` - Get reviews for a farmer
- `GET /api/v1/reviews/consumer/:consumerId` - Get reviews by a consumer
- `PUT /api/v1/reviews/:reviewId` - Update a review
- `DELETE /api/v1/reviews/:reviewId` - Delete a review

#### Farmer Responses
- `POST /api/v1/reviews/:reviewId/response` - Add farmer response to review

#### Review Interaction
- `POST /api/v1/reviews/:reviewId/helpful` - Mark review as helpful/unhelpful

#### Statistics
- `GET /api/v1/reviews/top-rated` - Get top-rated farmers
- `GET /api/v1/reviews/farmer/:farmerId/stats` - Get farmer review statistics

### Key Features

1. **One Review Per Consumer Per Farmer** - Enforced by unique constraint
2. **Verified Reviews** - Only consumers with active connections can review
3. **Detailed Category Ratings** - Product quality, delivery, communication, value for money
4. **Farmer Response System** - Farmers can respond to reviews
5. **Review Helpfulness Voting** - Consumers can vote on review usefulness
6. **Automatic Statistics Updates** - Triggers update farmer stats when reviews change
7. **Review Status Management** - Active, hidden, reported, deleted states

## 🎨 Frontend Implementation

### Components Created

#### 1. `ReviewForm.jsx`
- Interactive star rating system
- Detailed category ratings
- Review text and title input
- Anonymous review option
- Form validation

#### 2. `ReviewList.jsx`
- Paginated review display
- Filtering and sorting options
- Review helpfulness voting
- Farmer response display
- Review management actions

#### 3. `ReviewStats.jsx`
- Overall rating display
- Rating distribution chart
- Review metrics and statistics
- Recent activity tracking

#### 4. `FarmerResponseForm.jsx`
- Farmer response to reviews
- Professional response guidelines
- Character limit validation

### Pages Updated

#### Consumer Pages
- **Farmer Detail Page** (`/consumer/farmer/[id]`) - Added reviews tab with full review functionality
- **Consumer Reviews Page** (`/consumer/reviews`) - Manage all reviews written by consumer

#### Farmer Pages
- **Farmer Reviews Page** (`/farmer/reviews`) - Manage and respond to customer reviews

### Navigation Updates
- Added "Reviews" link to both consumer and farmer navigation menus

## 🚀 Usage Guide

### For Consumers

1. **Writing a Review**
   - Navigate to a farmer's profile page
   - Click "Write a Review" (only available if connected)
   - Rate the farmer (1-5 stars) and provide detailed ratings
   - Write a review title and detailed text
   - Submit the review

2. **Managing Reviews**
   - Go to "My Reviews" page
   - View all reviews you've written
   - Edit reviews within 24 hours
   - Delete reviews if needed

3. **Voting on Reviews**
   - Click "Yes" or "No" on "Was this review helpful?" section
   - Help other consumers find useful reviews

### For Farmers

1. **Viewing Reviews**
   - Go to "Reviews" page in farmer dashboard
   - View all customer reviews
   - See review statistics and metrics

2. **Responding to Reviews**
   - Click "Respond" button on any review
   - Write a professional response
   - Responses are visible to all users

3. **Review Analytics**
   - View overall rating and total review count
   - See rating distribution
   - Track response rate and engagement

## 🔒 Business Rules

1. **Connection Requirement** - Only consumers with active connections can review farmers
2. **One Review Per Relationship** - Each consumer can only review each farmer once
3. **Review Verification** - All reviews are marked as verified purchases
4. **Rating Validation** - All ratings must be between 1-5 stars
5. **Edit Time Limit** - Reviews can only be edited within 24 hours
6. **Automatic Statistics** - Farmer statistics update automatically via triggers

## 📊 Database Triggers

The system includes PostgreSQL triggers that automatically update farmer statistics when reviews are added, modified, or deleted:

- `trigger_update_farmer_rating_stats()` - Updates farmer profile rating statistics
- `trigger_update_farmer_review_activity_stats()` - Updates farmer activity summary

## 🛠️ Installation & Setup

### Database Setup
1. Run the SQL files in order:
   ```bash
   # 1. Create review tables
   psql -d your_database -f backend/database/farmer_reviews_table.sql
   
   # 2. Add rating columns to farmer_profiles
   psql -d your_database -f backend/database/add_rating_columns_to_farmer_profiles.sql
   
   # 3. Update farmer activity summary
   psql -d your_database -f backend/database/update_farmer_activity_summary_for_reviews.sql
   ```

### Backend Setup
The review routes are automatically included in the main Express app via `backend/routes/reviewRoutes.js`.

### Frontend Setup
All review components are ready to use. The API service is available at `frontend/lib/reviewApi.js`.

## 🧪 Testing

### API Testing
Use the provided examples in `backend/database/review_system_implementation_guide.sql` to test the API endpoints.

### Frontend Testing
1. Create a connection between a consumer and farmer
2. Navigate to the farmer's profile page
3. Write a review in the Reviews tab
4. Check the farmer's reviews page to see the review
5. Test farmer response functionality

## 🔮 Future Enhancements

1. **Review Moderation** - Admin tools for managing inappropriate reviews
2. **Review Analytics** - Advanced analytics and reporting
3. **Review Notifications** - Email notifications for new reviews and responses
4. **Review Templates** - Pre-defined review templates for common scenarios
5. **Photo Reviews** - Allow consumers to upload photos with reviews
6. **Review Rewards** - Incentive system for writing helpful reviews

## 📝 API Examples

### Adding a Review
```javascript
const reviewData = {
  farmer_id: 1,
  consumer_id: 2,
  active_connection_id: 3,
  rating: 5,
  review_title: "Excellent fresh milk!",
  review_text: "The milk quality is outstanding and delivery was on time.",
  product_quality_rating: 5,
  delivery_rating: 4,
  communication_rating: 5,
  value_for_money_rating: 5,
  is_anonymous: false
};

const response = await reviewApi.addReview(reviewData);
```

### Getting Farmer Reviews
```javascript
const reviews = await reviewApi.getFarmerReviews(farmerId, {
  page: 1,
  limit: 10,
  sort_by: 'created_at',
  order: 'desc',
  rating_filter: '5'
});
```

### Adding Farmer Response
```javascript
const response = await reviewApi.addFarmerResponse(reviewId, {
  farmer_id: 1,
  response_text: "Thank you for your kind words!"
});
```

## 🎉 Conclusion

The review system is now fully integrated into the Dairy Project, providing a comprehensive feedback mechanism that enhances trust and transparency between consumers and farmers. The system is designed to be scalable, maintainable, and user-friendly while providing valuable insights for all stakeholders.
