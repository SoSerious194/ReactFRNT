# Mobile App Integration Guide

## Problem Analysis

The mobile app and web admin are creating GetStream channels differently, causing them to not see the same conversations. Here's what needs to be changed:

## Current Mobile App Implementation

Based on your description, the mobile app uses:
- **GetStream** for real-time chat
- **Supabase** for user management and fitness data
- **Channel creation** via `client.channel('messaging', channelId, { members: [userData.id, coachData.id] })`

## Required Changes for Mobile App

### 1. **Channel ID Generation** (CRITICAL)

**Current Mobile App:**
```typescript
// Mobile app likely uses something like:
const channelId = `${userData.id}-${coachData.id}`;
// or
const channelId = `${coachData.id}-${userData.id}`;
```

**Required Change:**
```typescript
// Use the SAME channel ID generation as web admin
const combinedIds = [userData.id, coachData.id].sort().join("-");
const hash = combinedIds.split("").reduce((a, b) => {
  a = (a << 5) - a + b.charCodeAt(0);
  return a & a;
}, 0);
const channelId = `chat_${Math.abs(hash).toString(36)}`;
```

### 2. **User Creation in GetStream**

**Add to Mobile App:**
```typescript
// Ensure users exist in GetStream before creating channels
const createOrUpdateUser = async (userId: string, userName: string) => {
  try {
    // Call your backend API to create user
    const response = await fetch('/api/stream-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName })
    });
    
    if (!response.ok) {
      console.error('Failed to create user in GetStream');
    }
  } catch (error) {
    console.error('Error creating user:', error);
  }
};
```

### 3. **Channel Creation Flow**

**Update Mobile App Channel Creation:**
```typescript
const createOrGetChannel = async (userId: string, coachId: string) => {
  try {
    // 1. Ensure both users exist in GetStream
    await createOrUpdateUser(userId, userData.name);
    await createOrUpdateUser(coachId, coachData.name);
    
    // 2. Use the SAME channel ID generation as web admin
    const combinedIds = [userId, coachId].sort().join("-");
    const hash = combinedIds.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const channelId = `chat_${Math.abs(hash).toString(36)}`;
    
    // 3. Create or get the channel
    const channel = client.channel('messaging', channelId, {
      members: [userId, coachId],
    });
    
    // 4. Initialize the channel
    await channel.watch();
    
    return channel;
  } catch (error) {
    console.error('Error creating channel:', error);
    throw error;
  }
};
```

### 4. **Backend API Endpoint** (Mobile App Backend)

**Create this endpoint in your mobile app backend:**
```typescript
// POST /api/stream-user
export async function POST(request: Request) {
  try {
    const { userId, userName } = await request.json();
    
    const serverClient = StreamChat.getInstance(
      process.env.STREAM_API_KEY!,
      process.env.STREAM_API_SECRET!
    );
    
    // Create or update the user in GetStream
    await serverClient.upsertUser({
      id: userId,
      name: userName,
    });
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
```

### 5. **Environment Variables** (Mobile App)

**Add to your mobile app environment:**
```env
# GetStream API Keys (same as web admin)
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
```

## Complete Mobile App Integration Steps

### Step 1: Update Channel ID Generation
Replace your current channel ID generation with the web admin's algorithm.

### Step 2: Add User Creation
Ensure users are created in GetStream before creating channels.

### Step 3: Update Channel Creation Flow
Use the same flow as web admin:
1. Create users in GetStream
2. Generate channel ID using hash algorithm
3. Create channel with proper members

### Step 4: Add Backend API
Create the `/api/stream-user` endpoint in your mobile app backend.

### Step 5: Test Integration
1. Create a conversation on mobile app
2. Check if it appears in web admin
3. Send messages from both sides
4. Verify real-time updates

## Code Examples

### Mobile App Channel Creation (Updated)
```typescript
// src/services/coach.services.ts (Mobile App)
export const createOrGetChannel = async (userId: string, coachId: string) => {
  try {
    // 1. Create users in GetStream
    await createUserInGetStream(userId, userData.name);
    await createUserInGetStream(coachId, coachData.name);
    
    // 2. Generate channel ID (SAME as web admin)
    const combinedIds = [userId, coachId].sort().join("-");
    const hash = combinedIds.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const channelId = `chat_${Math.abs(hash).toString(36)}`;
    
    // 3. Create channel
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

const createUserInGetStream = async (userId: string, userName: string) => {
  try {
    const response = await fetch('/api/stream-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName })
    });
    
    if (!response.ok) {
      console.error('Failed to create user in GetStream');
    }
  } catch (error) {
    console.error('Error creating user:', error);
  }
};
```

### Mobile App Backend API
```typescript
// Mobile app backend API route
// POST /api/stream-user
import { StreamChat } from 'stream-chat';

const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

export async function POST(request: Request) {
  try {
    const { userId, userName } = await request.json();
    
    await serverClient.upsertUser({
      id: userId,
      name: userName,
    });
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
```

## Testing Checklist

- [ ] Mobile app creates channels with same ID as web admin
- [ ] Users are created in GetStream before channel creation
- [ ] Messages sent from mobile appear in web admin
- [ ] Messages sent from web admin appear in mobile app
- [ ] Real-time updates work in both directions
- [ ] File uploads work in both directions

## Troubleshooting

### Channels Still Not Visible?
1. **Check channel ID generation**: Ensure both apps use the same algorithm
2. **Verify user creation**: Check GetStream dashboard for users
3. **Check channel members**: Ensure both users are added to channel
4. **Verify API keys**: Use same GetStream app for both mobile and web

### Messages Not Syncing?
1. **Check real-time subscriptions**: Ensure both apps subscribe to same channel
2. **Verify channel ID**: Double-check channel ID generation
3. **Check user permissions**: Ensure users have access to channels
4. **Test with simple messages**: Start with text messages before files

### File Uploads Not Working?
1. **Check GetStream file service**: Ensure it's properly configured
2. **Verify file permissions**: Check GetStream file access settings
3. **Test file types**: Ensure supported file types are configured
4. **Check file size limits**: Verify limits are set correctly

## Summary

The key changes needed for mobile app integration:

1. **Use the same channel ID generation algorithm** as web admin
2. **Create users in GetStream** before creating channels
3. **Add backend API endpoint** for user creation
4. **Use the same GetStream app** for both mobile and web
5. **Test thoroughly** to ensure real-time communication works

Once these changes are implemented, mobile app users and web admin coaches will see the same conversations and can communicate in real-time! 