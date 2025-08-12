# QStash Implementation Testing Guide

## 🔧 **Step 1: Generate and Set Environment Variables**

### **Generate SCHEDULER_API_KEY**
You need to create a custom API key to secure the webhook endpoint. You can generate one using any of these methods:

**Option 1: Use a secure random generator**
```bash
# Generate a 32-character random string
openssl rand -hex 16
```

**Option 2: Use an online generator**
- Go to [randomkeygen.com](https://randomkeygen.com)
- Generate a 32-character random string

**Option 3: Use Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

**Example generated key:**
```
a1b2c3d4e5f678901234567890123456
```

### **Set Environment Variables**
Ensure these environment variables are set in your Vercel dashboard:

```bash
# Required for QStash
QSTASH_TOKEN=your_qstash_token_here
QSTASH_CURRENT_SIGNING_KEY=your_current_signing_key_here
QSTASH_NEXT_SIGNING_KEY=your_next_signing_key_here

# Required for message processing
SCHEDULER_API_KEY=your_custom_api_key_here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Example (replace with your actual values):
# SCHEDULER_API_KEY=a1b2c3d4e5f678901234567890123456
# NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# Existing variables (should already be set)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
OPENAI_API_KEY=your_openai_api_key
```

### **How SCHEDULER_API_KEY Works**
The `SCHEDULER_API_KEY` is used to secure the webhook endpoint that QStash calls:

1. **QStash sends requests** to your `/api/process-scheduled-messages` endpoint
2. **Each request includes** an `Authorization: Bearer YOUR_API_KEY` header
3. **Your API validates** this header to ensure the request is legitimate
4. **This prevents unauthorized access** to your message processing endpoint

**Security Benefits:**
- ✅ Prevents unauthorized message processing
- ✅ Ensures only QStash can trigger message delivery
- ✅ Protects against potential abuse

## 🗄️ **Step 2: Update Database Schema**

Run this SQL in your Supabase dashboard:

```sql
-- Add qstash_id column to track QStash message IDs
ALTER TABLE scheduled_messages 
ADD COLUMN qstash_id TEXT;

-- Add index for better performance
CREATE INDEX idx_scheduled_messages_qstash_id ON scheduled_messages(qstash_id);
```

## 🧪 **Step 3: Testing Scenarios**

### **Test 1: One-Time Message (Immediate)**
1. **Go to your deployed app** → Inbox → Message Scheduler
2. **Schedule a message** for 2-3 minutes from now
3. **Set target** to "All Clients" or specific clients
4. **Click "Schedule Message"**
5. **Wait for the scheduled time**
6. **Check your chat system** for the delivered message

### **Test 2: One-Time Message (Future)**
1. **Schedule a message** for tomorrow at a specific time
2. **Verify in QStash dashboard** that the message is scheduled
3. **Wait until the scheduled time**
4. **Check message delivery**

### **Test 3: Recurring Message (Daily)**
1. **Schedule a daily message** for 9:00 AM
2. **Verify it appears in QStash schedules**
3. **Wait for the next occurrence**
4. **Check message delivery**

### **Test 4: Recurring Message (Weekly)**
1. **Schedule a weekly message** for Monday 10:00 AM
2. **Verify cron expression** in QStash dashboard
3. **Wait for next Monday**
4. **Check message delivery**

## 🔍 **Step 4: Monitoring & Debugging**

### **Check QStash Dashboard**
1. Go to [upstash.com](https://upstash.com) → QStash Dashboard
2. **View scheduled messages** in the "Schedules" tab
3. **Check delivery logs** in the "Logs" tab
4. **Monitor failed deliveries** and retry attempts

### **Check Vercel Logs**
1. Go to Vercel Dashboard → Your Project → Functions
2. **Check `/api/process-scheduled-messages` logs**
3. **Look for errors** or successful processing

### **Check Supabase Logs**
1. Go to Supabase Dashboard → Logs
2. **Check for database operations**
3. **Verify message delivery records**

## 🚨 **Step 5: Troubleshooting**

### **Issue: Message Status Shows "Completed" But No Message in Chat**

**✅ RESOLVED: Server-Side GetStream Authentication**

This issue has been fixed by implementing proper server-side GetStream authentication. The problem was that GetStream was trying to use client-side authentication on the server side.

**Solution implemented:**
- Created dedicated server-side GetStream service
- Uses proper server-side API keys and authentication
- Ensures users are created in GetStream before sending messages

If you encounter this issue again, check Vercel function logs for any GetStream-related errors.

### **Common Issues & Solutions**

#### **Issue: "QSTASH_TOKEN is not set" or "invalid token" errors**
**Cause:** Environment variables are not accessible on the client side or token is incorrect.

**Solution:**
1. **Verify environment variables** are set in Vercel dashboard
2. **Check token format** - should be a 32-character hex string
3. **Redeploy** after adding environment variables

**Test the API endpoint:**
```bash
# Test the QStash scheduling API
curl -X POST https://your-app.vercel.app/api/qstash-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "test-123",
    "scheduledTime": "2024-01-01T10:00:00Z",
    "coachId": "your-coach-id",
    "scheduleType": "once"
  }'
```

#### **Issue: "Invalid channel id, can't contain the : character"**
**Cause:** GetStream channel IDs cannot contain special characters like colons.

**Solution:** ✅ **FIXED** - Channel IDs are now sanitized to remove special characters and use safe format.

#### **Issue: "Can't find channel with id messaging:messaging_..."**
**Cause:** Channel ID was being constructed with duplicate "messaging" prefix.

**Solution:** ✅ **FIXED** - Removed duplicate prefix from channel ID construction.

#### **Issue: Messages not being scheduled**
**Check:**
- QStash token is correct
- Environment variables are set
- API endpoint is accessible

**Solution:**
```bash
# Test QStash connection
curl -X POST https://your-app.vercel.app/api/process-scheduled-messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-scheduler-api-key" \
  -d '{"messageId": "test", "coachId": "your-coach-id"}'
```

#### **Issue: Messages not being delivered**
**Check:**
- Stream API credentials
- User assignments in database
- Message content format

**Solution:**
- Verify Stream API keys in environment
- Check user coach assignments
- Test manual message sending

#### **Issue: QStash webhook failures**
**Check:**
- Webhook URL is accessible
- Authorization header is correct
- Request body format

**Solution:**
- Verify `NEXT_PUBLIC_APP_URL` is correct
- Check `SCHEDULER_API_KEY` matches
- Test webhook endpoint manually

## 📊 **Step 6: Performance Testing**

### **Load Testing**
1. **Schedule 10+ messages** for the same time
2. **Monitor processing speed**
3. **Check for any rate limiting**

### **Concurrent Testing**
1. **Schedule messages** from multiple coaches
2. **Verify isolation** between different coaches
3. **Check database performance**

## ✅ **Step 7: Success Criteria**

Your implementation is working correctly if:

- ✅ **Messages are scheduled** in QStash dashboard
- ✅ **Messages are delivered** at the correct time
- ✅ **Recurring messages** work as expected
- ✅ **Failed deliveries** are retried automatically
- ✅ **No duplicate messages** are sent
- ✅ **Database records** are updated correctly
- ✅ **Logs show** successful processing

## 🔄 **Step 8: Production Monitoring**

### **Set up Alerts**
1. **Monitor QStash delivery rates**
2. **Set up error notifications**
3. **Track message delivery success rates**

### **Regular Checks**
1. **Weekly review** of failed deliveries
2. **Monthly audit** of scheduled messages
3. **Quarterly performance** review

## 📞 **Support**

If you encounter issues:
1. **Check QStash documentation**: [docs.upstash.com/qstash](https://docs.upstash.com/qstash)
2. **Review Vercel function logs**
3. **Check Supabase database logs**
4. **Test with simpler scenarios** first
