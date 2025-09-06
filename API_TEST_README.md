# AutoGreen.sg API Testing Guide for Judges

## Overview
This document provides comprehensive API testing instructions for the AutoGreen.sg browser extension backend. Since the extension primarily works during actual e-commerce transactions (which are difficult to demonstrate in a judging environment), this guide focuses on testing the core API functionality that powers the extension.

## Quick Start

### 1. Start the Development Server
```bash
cd next-app
npm install
npm run dev
```
The server will run on `http://localhost:3000`

### 2. Database Setup
The application uses Neon PostgreSQL database. The connection is already configured in the environment variables.

## API Endpoints Testing

### Base URL: `http://localhost:3000/api`

---

## 1. User Statistics API

### GET `/api/users/stats?userId={userId}`
**Purpose:** Retrieve user's eco-friendly statistics

#### Test Cases:

**Test 1: Get stats for existing user**
```bash
curl "http://localhost:3000/api/users/stats?userId=test_user_123"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "userId": "test_user_123",
    "greenPoints": 0,
    "streak": 0,
    "itemsSaved": 0,
    "noCutlery": 0,
    "greenDelivery": 0,
    "paperless": 0,
    "ecoProducts": 0
  }
}
```

**Test 2: Get stats without userId (should fail)**
```bash
curl "http://localhost:3000/api/users/stats"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "userId parameter is required"
}
```

---

### POST `/api/users/stats`
**Purpose:** Record eco-friendly actions and update user statistics

#### Test Cases:

**Test 3: Record a "no cutlery" action**
```bash
curl -X POST "http://localhost:3000/api/users/stats" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "action": "no_cutlery",
    "points": 1
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Action recorded successfully",
  "data": {
    "userId": "test_user_123",
    "greenPoints": 1,
    "noCutlery": 1,
    "itemsSaved": 1
  }
}
```

**Test 4: Record green delivery action**
```bash
curl -X POST "http://localhost:3000/api/users/stats" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "action": "green_delivery",
    "points": 2
  }'
```

**Test 5: Record paperless receipt action**
```bash
curl -X POST "http://localhost:3000/api/users/stats" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "action": "paperless",
    "points": 1
  }'
```

**Test 6: Record eco product selection**
```bash
curl -X POST "http://localhost:3000/api/users/stats" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "action": "eco_product",
    "points": 3
  }'
```

---

## 2. General User API

### GET `/api/users?userId={userId}`
**Purpose:** Get general user information

**Test 7: Get user info**
```bash
curl "http://localhost:3000/api/users?userId=test_user_123"
```

---

## 3. Leaderboard Testing

### GET `/api/leaderboard`
**Purpose:** Get top users by green points

**Test 8: Get leaderboard**
```bash
curl "http://localhost:3000/api/leaderboard"
```

---

## Browser Testing Sequence

### Complete User Journey Test
Run these commands in sequence to simulate a complete user journey:

```bash
# 1. Check initial stats (should be 0)
curl "http://localhost:3000/api/users/stats?userId=judge_test_user"

# 2. User chooses no cutlery (+1 point)
curl -X POST "http://localhost:3000/api/users/stats" \
  -H "Content-Type: application/json" \
  -d '{"userId": "judge_test_user", "action": "no_cutlery", "points": 1}'

# 3. User selects green delivery (+2 points)
curl -X POST "http://localhost:3000/api/users/stats" \
  -H "Content-Type: application/json" \
  -d '{"userId": "judge_test_user", "action": "green_delivery", "points": 2}'

# 4. User opts for paperless receipt (+1 point)
curl -X POST "http://localhost:3000/api/users/stats" \
  -H "Content-Type: application/json" \
  -d '{"userId": "judge_test_user", "action": "paperless", "points": 1}'

# 5. User selects eco-friendly product (+3 points)
curl -X POST "http://localhost:3000/api/users/stats" \
  -H "Content-Type: application/json" \
  -d '{"userId": "judge_test_user", "action": "eco_product", "points": 3}'

# 6. Check final stats (should show accumulated points and actions)
curl "http://localhost:3000/api/users/stats?userId=judge_test_user"

# 7. Check leaderboard (should include our test user)
curl "http://localhost:3000/api/leaderboard"
```

**Expected Final Stats:**
```json
{
  "success": true,
  "data": {
    "userId": "judge_test_user",
    "greenPoints": 7,
    "noCutlery": 1,
    "greenDelivery": 1,
    "paperless": 1,
    "ecoProducts": 1,
    "itemsSaved": 4
  }
}
```

---

## Extension Testing

### Browser Extension Demo
1. Load the extension in Chrome Developer Mode
2. Visit `lazada.sg` or `shopee.sg`
3. Open the extension popup
4. The popup should show:
   - User stats (fetched from API)
   - Deep scan toggle functionality
   - Site detection (Active/Standby status)

### Testing on Unsupported Sites
1. Visit any non-e-commerce site (e.g., `google.com`)
2. Open extension popup
3. Should display "unsupported site" message with list of supported sites

---

## Key Features Demonstrated

### 1. **Real-time API Integration**
- Extension fetches user stats from live database
- Supports CORS for browser extension communication
- Handles offline/error scenarios gracefully

### 2. **Site Detection Logic**
- Extension only activates on supported e-commerce sites
- Clear user feedback about site compatibility
- Proper fallback for unsupported sites

### 3. **Eco-Action Tracking**
- Multiple types of eco-friendly actions
- Point system for gamification
- Cumulative statistics tracking

### 4. **Error Handling**
- API timeout protection
- Fallback to default values
- Clear error messaging

---

## Technical Architecture

### Backend Stack
- **Next.js 14** - Full-stack framework
- **PostgreSQL (Neon)** - Cloud database
- **CORS enabled** - Browser extension compatibility

### Frontend Stack
- **Chrome Extension Manifest V3**
- **Vanilla JavaScript** - No framework dependencies
- **Chrome APIs** - Storage, tabs, downloads

### Database Schema
- Users table with eco-statistics
- Efficient querying for real-time updates
- Scalable for multiple users

---

## Additional Testing Notes

### Environment Variables Required
```
DATABASE_URL=postgresql://...
```

### CORS Configuration
The API includes proper CORS headers for browser extension communication:
```javascript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
```

### Performance Considerations
- API responses cached for 5 seconds
- Database queries optimized
- Graceful degradation when API unavailable

---

## Conclusion

This API testing guide demonstrates the full functionality of the AutoGreen.sg backend system. While the extension's primary value is realized during actual e-commerce transactions, the API testing shows the robust infrastructure supporting eco-friendly behavior tracking and gamification.

The system is production-ready and designed to scale with user adoption across Singapore's major e-commerce platforms.
