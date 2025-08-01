# Inbox Implementation for Coach Web Admin

## Overview

This implementation provides a real-time chat system for coaches to communicate with their assigned clients. The system integrates with **GetStream** for real-time messaging and **Supabase** for user management and fitness data.

## Features Implemented

### ✅ Core Chat Functionality
- **Real-time messaging** using GetStream's Stream Chat
- **File uploads** (images, videos, audio, documents) via GetStream
- **Message history** with conversation persistence
- **User authentication** with Supabase Auth
- **Client list** showing assigned users
- **Search functionality** for clients

### ✅ UI Components
- **MemberListSection**: Displays assigned clients with search
- **MessageSection**: GetStream Chat interface with file upload support
- **ChatSection**: Client information and fitness data
- **Responsive design** with modern UI

### ✅ Backend Services
- **ChatServices**: Handles GetStream operations and Supabase user management
- **Real-time subscriptions**: Live message updates via GetStream
- **File storage**: GetStream file service integration
- **User management**: Coach-client relationships via Supabase

## Technology Stack

### GetStream (Stream Chat)
- **Real-time messaging**: WebSocket connections for live updates
- **File handling**: Built-in file upload and storage
- **Channel management**: Automatic conversation creation
- **Message persistence**: Complete message history

### Supabase
- **User authentication**: Login/logout functionality
- **User management**: Coach-client relationships
- **Fitness data**: Workout and exercise logs
- **Profile information**: User details and statistics

## Database Schema

The implementation uses a hybrid approach:

```sql
-- Supabase: Users table (coaches and clients)
users: {
  id: string
  full_name: string
  email: string
  coach: string (user_id of assigned coach)
  role: "user" | "coach"
  profile_image_url: string
  last_app_open: string
  app_open_streak: number
  habit_streak: number
}

-- GetStream: Messages and Channels
-- Handled automatically by GetStream's infrastructure
-- No manual database management required
```

## Key Components

### 1. ChatServices (`src/lib/chatServices.ts`)
Handles all chat-related operations:
- `connectCoach()`: Connect coach to GetStream
- `getAssignedUsers()`: Get coach's assigned clients from Supabase
- `getOrCreateChannel()`: Create/find GetStream channel between users
- `getCoachChannels()`: Get all channels for a coach
- `getUserFitnessData()`: Get user fitness data from Supabase

### 2. ChatContext (`src/lib/chatContext.tsx`)
React context for managing chat state:
- GetStream client management
- Channel selection
- User selection
- Loading states

### 3. MemberListSection
- Displays assigned clients from Supabase
- Search functionality
- User selection
- Last activity indicators

### 4. MessageSection
- Uses GetStream's Chat components
- Real-time message display
- Built-in file upload support
- Message input with keyboard shortcuts
- Auto-scroll to latest messages

### 5. ChatSection
- Client profile information from Supabase
- Fitness data display
- Recent workouts and exercises
- User statistics

## Authentication Flow

1. **Login Page** (`/login`): Supabase authentication
2. **Middleware**: Protects routes and handles redirects
3. **Auth Hook**: Manages user session state
4. **GetStream Connection**: Automatic connection after login
5. **Protected Routes**: Require authentication to access

## Real-time Features

### Message Updates
- Uses GetStream's real-time infrastructure
- Automatic channel subscriptions
- Live message updates
- Built-in typing indicators and read receipts

### File Handling
- Supports multiple file types (images, videos, audio, documents)
- Handled by GetStream's file service
- Automatic file preview and download
- No manual storage management required

## API Routes

### Stream Token Generation (`/api/stream-token`)
```typescript
POST /api/stream-token
{
  "userId": string,
  "userName": string
}
```
Returns a GetStream token for user authentication.

## Usage Instructions

### For Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Access the login page**:
   ```
   http://localhost:3000/login
   ```

3. **Create an account**:
   - Use any email/password combination
   - The system will create a new account if it doesn't exist

4. **Access the inbox**:
   ```
   http://localhost:3000/inbox
   ```

### For Production

1. **Set up GetStream**:
   - Create a GetStream account
   - Get API keys
   - Configure environment variables

2. **Set up Supabase**:
   - Configure environment variables
   - Set up user management
   - Configure RLS policies

3. **Environment Variables**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
   STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret
   ```

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# GetStream
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
```

## File Structure

```
src/
├── app/
│   ├── inbox/
│   │   └── page.tsx          # Main inbox page
│   ├── login/
│   │   └── page.tsx          # Login page
│   └── api/
│       └── stream-token/
│           └── route.ts      # GetStream token generation
├── components/
│   └── sections/
│       ├── MemberListSection/ # Client list
│       ├── MessageSection/    # GetStream Chat interface
│       └── ChatSection/       # Client info
├── lib/
│   ├── chatServices.ts       # GetStream + Supabase API functions
│   ├── chatContext.tsx       # React context
│   └── useAuth.ts           # Authentication hook
└── utils/
    └── supabase/
        └── client.tsx        # Supabase client
```

## GetStream Integration Details

### Channel Management
- Each user-coach conversation is a GetStream channel
- Channel ID format: `[coachId, userId].sort().join('-')`
- Automatic channel creation when users start chatting

### Message Handling
- All messages stored in GetStream
- Real-time updates via WebSocket
- File attachments handled automatically
- Message history persistence

### User Connection
- Coaches connect to GetStream on login
- User tokens generated via API route
- Automatic reconnection handling

## Future Enhancements

### Planned Features
- [ ] Custom message components
- [ ] Message reactions and emojis
- [ ] Message editing and deletion
- [ ] Read receipts customization
- [ ] Typing indicators
- [ ] Message search
- [ ] Conversation archiving

### AI Integration
- [ ] @ai mentions for AI responses
- [ ] RAG integration for personalized responses
- [ ] AI-powered message suggestions
- [ ] Automated fitness insights

### Advanced Features
- [ ] Group conversations
- [ ] Message scheduling
- [ ] Conversation analytics
- [ ] Export chat history
- [ ] Mobile-responsive design improvements

## Troubleshooting

### Common Issues

1. **GetStream connection failing**:
   - Check API keys in environment variables
   - Verify token generation API route
   - Check network connectivity

2. **File uploads failing**:
   - Verify GetStream file service configuration
   - Check file size limits
   - Ensure proper CORS configuration

3. **Authentication issues**:
   - Check Supabase environment variables
   - Verify Supabase Auth settings
   - Clear browser cookies

4. **Messages not loading**:
   - Check GetStream channel creation
   - Verify user permissions
   - Check channel member assignments

## Security Considerations

- GetStream handles message security
- File access controlled by GetStream policies
- Authentication required for all protected routes
- User sessions properly managed
- API keys secured in environment variables

## Performance Optimizations

- GetStream handles real-time optimization
- Lazy loading of user avatars
- Debounced search functionality
- Efficient channel management
- Built-in file optimization

## Migration from Supabase Chat

This implementation replaces the previous Supabase-based chat with GetStream:

### Benefits
- **Better real-time performance**: WebSocket-based
- **Built-in file handling**: No manual storage management
- **Rich UI components**: Pre-built chat interface
- **Advanced features**: Typing indicators, read receipts
- **Scalability**: Enterprise-grade infrastructure

### Migration Steps
1. Install GetStream packages
2. Update environment variables
3. Replace chat services
4. Update UI components
5. Test real-time functionality 