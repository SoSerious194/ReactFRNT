# GetStream Setup Guide

## Error Resolution

The error you're seeing is because regular users can't create other users in GetStream. I've fixed this by using server-side API calls with admin permissions.

## Step 1: Get GetStream API Keys

1. Go to [GetStream Dashboard](https://dashboard.getstream.io/)
2. Create a new app or use an existing one
3. Go to the "API Keys" section
4. Copy your:
   - **API Key** (starts with `xxx`)
   - **API Secret** (starts with `xxx`)

## Step 2: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase (if you have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# GetStream (REQUIRED)
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key_here
STREAM_API_KEY=your_stream_api_key_here
STREAM_API_SECRET=your_stream_api_secret_here
```

## Step 3: Restart Development Server

```bash
npm run dev
```

## Step 4: Test the Application

1. Go to `http://localhost:3000/login`
2. Create an account or log in
3. Navigate to `http://localhost:3000/inbox`
4. The chat should now work properly

## What I Fixed

### Permission Issue
The error `"User with role 'user' is not allowed to perform action UpdateUser"` was caused by:
- Regular users trying to create/update other users in GetStream
- Missing admin permissions for user management
- Client-side user creation instead of server-side

### Solution Implemented:

1. **Server-side User Creation**: 
   - Created `/api/stream-user` endpoint
   - Uses server-side client with admin permissions
   - Handles user creation with proper authorization

2. **Client-side API Calls**: 
   - Client now calls server API to create users
   - No more direct client-side user updates
   - Better error handling and logging

3. **Improved Error Handling**:
   - Graceful fallbacks for user creation failures
   - Better logging for debugging
   - Demo mode support

4. **Proper Flow**:
   - Create users via server API first
   - Then create channels with existing users
   - Better separation of concerns

## Connection Issue Fix
The error `"Both secret and user tokens are not set"` was caused by:
- Trying to use the Stream client before it was connected
- Attempting to create users/channels without proper authentication
- Missing connection state checks

### Solution Implemented:

1. **Proper Connection Flow**: 
   - Connect user first with token
   - Then create other users via server API
   - Finally create channels

2. **Connection State Checks**: 
   - Verify client is connected before operations
   - Check `streamClient.userID` exists
   - Better error handling for connection issues

3. **Improved Error Handling**:
   - Clear error messages for connection issues
   - Graceful fallbacks for missing connections
   - Better user feedback in UI

4. **Connection Order**:
   - Coach connects first with token
   - Then other users are created via server API
   - Channels created only after all users exist

## Channel ID Fix

The original error was caused by channel IDs being too long. I've fixed this by:

1. **Shortening channel IDs**: Using a hash function to create shorter, unique IDs
2. **Adding validation**: Ensuring IDs are under 64 characters
3. **Better error handling**: Clear error messages for configuration issues

## Demo Mode

If you don't have GetStream API keys yet, the app will show a clear error message instead of crashing. This helps with development and testing.

## Troubleshooting

### Still getting permission errors?

1. **Check API keys**: Ensure both API key and secret are correct
2. **Check server logs**: Look for user creation success/error messages
3. **Verify API endpoints**: Ensure `/api/stream-user` is working
4. **Check GetStream Dashboard**: Verify users are being created

### Still getting connection errors?

1. **Check environment variables**: Make sure they're set correctly
2. **Restart the server**: Environment changes require a restart
3. **Check console**: Look for specific error messages
4. **Verify API keys**: Ensure they're copied correctly from GetStream dashboard
5. **Check connection flow**: Ensure coach connects before selecting clients

### Connection flow issues?

1. **Check API keys**: Ensure both API key and secret are correct
2. **Check console logs**: Look for connection success/error messages
3. **Verify token generation**: Check if tokens are being generated properly
4. **Check GetStream Dashboard**: Verify users are being created

### User creation issues?

1. **Check API keys**: Ensure both API key and secret are correct
2. **Check GetStream Dashboard**: Look for users in the "Users" section
3. **Check console logs**: Look for user creation success/error messages
4. **Verify user IDs**: Ensure user IDs are valid UUIDs
5. **Check server API**: Verify `/api/stream-user` endpoint is working

### Channel ID still too long?

The new implementation creates IDs like `chat_1a2b3c4d` which are much shorter than the previous UUID-based approach.

## Next Steps

Once GetStream is configured:

1. **Test real-time messaging**: Messages should appear instantly
2. **Test file uploads**: Images and documents should work
3. **Test with mobile app**: Web and mobile should communicate through the same GetStream channels
4. **Check GetStream Dashboard**: Verify users and channels are being created

## Support

If you're still having issues:

1. Check the browser console for specific error messages
2. Verify your GetStream API keys are correct
3. Ensure your GetStream app is properly configured
4. Check that your Supabase setup is working for user management
5. Look in the GetStream Dashboard to see if users and channels are being created
6. Check the connection flow in the console logs
7. Verify the server API endpoints are working correctly 