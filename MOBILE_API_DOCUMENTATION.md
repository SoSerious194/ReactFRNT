# Mobile App API Documentation

## Base URL
```
https://your-web-domain.com/api
```

## Authentication
All APIs require proper GetStream API keys to be configured on the server.

## API Endpoints

### 1. Create/Update User in GetStream

**Endpoint:** `POST /api/stream-user`

**Description:** Creates or updates a user in GetStream and returns a JWT token for authentication.

**Request:**
```bash
curl -X POST https://your-web-domain.com/api/stream-user \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "5226116a-a31b-4927-a296-2c0a7ec3ee75",
    "userName": "Huzefa Khety"
  }'
```

**Request Body:**
```json
{
  "userId": "string (required)",
  "userName": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTIyNjExNmEtYTFiLTQ5MjctYTI5Ni0yYzBhN2VlNzUiLCJleHAiOjE3MzU2NzIwMDAsImlhdCI6MTczNTU4NTYwMH0.signature"
}
```

**Demo Mode Response (200):**
```json
{
  "success": true,
  "demo": true,
  "token": "demo_token"
}
```

**Error Response (400):**
```json
{
  "error": "Missing userId or userName"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to create user in GetStream"
}
```

### 2. Generate JWT Token

**Endpoint:** `POST /api/stream-token`

**Description:** Generates a JWT token for a user to authenticate with GetStream.

**Request:**
```bash
curl -X POST https://your-web-domain.com/api/stream-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "5226116a-a31b-4927-a296-2c0a7ec3ee75"
  }'
```

**Request Body:**
```json
{
  "userId": "string (required)",
  "userName": "string (optional)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTIyNjExNmEtYTFiLTQ5MjctYTI5Ni0yYzBhN2VlNzUiLCJleHAiOjE3MzU2NzIwMDAsImlhdCI6MTczNTU4NTYwMH0.signature"
}
```

**Demo Mode Response (200):**
```json
{
  "success": true,
  "demo": true,
  "token": "demo_token"
}
```

**Error Response (400):**
```json
{
  "error": "Missing userId"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to generate token"
}
```

## Mobile App Integration Examples

### React Native Example

```typescript
// src/services/streamApi.ts
const API_BASE_URL = 'https://your-web-domain.com/api';

export class StreamApiService {
  // Create/Update User
  static async createOrUpdateUser(userId: string, userName: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/stream-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Generate Token
  static async generateToken(userId: string, userName?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/stream-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate token');
      }

      return data;
    } catch (error) {
      console.error('Error generating token:', error);
      throw error;
    }
  }
}
```

### Usage in Mobile App

```typescript
// src/services/coach.services.ts
import { StreamApiService } from './streamApi';

export const initializeGetStreamUser = async (userId: string, userName: string) => {
  try {
    // Create/Update user and get token
    const userResponse = await StreamApiService.createOrUpdateUser(userId, userName);
    
    // Connect to GetStream with the token
    const client = StreamChat.getInstance(process.env.STREAM_API_KEY!);
    await client.connectUser(
      {
        id: userId,
        name: userName,
      },
      userResponse.token
    );

    return client;
  } catch (error) {
    console.error('Error initializing GetStream user:', error);
    throw error;
  }
};

export const createOrGetChannel = async (userId: string, coachId: string) => {
  try {
    // Ensure both users exist in GetStream
    await StreamApiService.createOrUpdateUser(userId, userData.name);
    await StreamApiService.createOrUpdateUser(coachId, coachData.name);
    
    // Generate channel ID (SAME as web admin)
    const combinedIds = [userId, coachId].sort().join("-");
    const hash = combinedIds.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const channelId = `chat_${Math.abs(hash).toString(36)}`;
    
    // Create channel
    const channel = client.channel('messaging', channelId, {
      members: [userId, coachId],
    });
    
    await channel.watch();
    return channel;
  } catch (error) {
    console.error('Error creating channel:', error);
    throw error;
  }
};
```

## Error Handling

### Common Error Scenarios

1. **Missing API Keys**
   - Response: Demo mode with demo token
   - Action: Configure GetStream API keys on server

2. **Invalid User ID**
   - Response: 400 Bad Request
   - Action: Ensure valid UUID format

3. **GetStream Service Unavailable**
   - Response: 500 Internal Server Error
   - Action: Check GetStream service status

4. **Network Issues**
   - Response: Network error
   - Action: Check internet connection and API endpoint

### Error Handling in Mobile App

```typescript
const handleApiError = (error: any) => {
  if (error.message.includes('Missing')) {
    // Handle validation errors
    console.error('Validation error:', error.message);
  } else if (error.message.includes('Failed to create')) {
    // Handle GetStream errors
    console.error('GetStream error:', error.message);
  } else {
    // Handle network errors
    console.error('Network error:', error.message);
  }
};
```

## Testing

### Test with curl

```bash
# Test user creation
curl -X POST https://your-web-domain.com/api/stream-user \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "5226116a-a31b-4927-a296-2c0a7ec3ee75",
    "userName": "Huzefa Khety"
  }'

# Test token generation
curl -X POST https://your-web-domain.com/api/stream-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "5226116a-a31b-4927-a296-2c0a7ec3ee75"
  }'
```

### Test with Postman

1. Create a new POST request
2. Set URL to `https://your-web-domain.com/api/stream-user`
3. Set Content-Type header to `application/json`
4. Add request body:
   ```json
   {
     "userId": "5226116a-a31b-4927-a296-2c0a7ec3ee75",
     "userName": "Huzefa Khety"
   }
   ```
5. Send request and verify response

## Security Considerations

1. **API Keys**: Keep GetStream API keys secure on server
2. **User Validation**: Validate user IDs before processing
3. **Rate Limiting**: Consider implementing rate limiting
4. **HTTPS**: Always use HTTPS in production
5. **Token Expiration**: Tokens have expiration, handle refresh

## Environment Variables Required

On the server, ensure these environment variables are set:

```env
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
```

## Demo Mode

When API keys are not configured, the APIs return demo responses:

```json
{
  "success": true,
  "demo": true,
  "token": "demo_token"
}
```

This allows for testing without proper GetStream configuration. 