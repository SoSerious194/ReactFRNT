# QStash Setup Guide

## 🚀 **Why QStash?**

QStash is a better alternative to Vercel cron jobs because:
- ✅ **No frequency limitations** (unlike Vercel Hobby plan)
- ✅ **Free tier**: 10,000 requests/month
- ✅ **Reliable delivery** with retry mechanisms
- ✅ **Perfect for Next.js** applications
- ✅ **Cost-effective**: $0.50 per 10,000 requests after free tier

## 📋 **Setup Steps**

### 1. **Create QStash Account**
1. Go to [upstash.com](https://upstash.com)
2. Sign up for a free account
3. Create a new QStash database

### 2. **Get API Credentials**
1. In your QStash dashboard, copy your:
   - **QSTASH_TOKEN** (for server-side)
   - **QSTASH_CURRENT_SIGNING_KEY** (for webhook verification)
   - **QSTASH_NEXT_SIGNING_KEY** (for webhook verification)

### 3. **Add Environment Variables**
Add these to your `.env.local`:
```bash
QSTASH_TOKEN=your_qstash_token_here
QSTASH_CURRENT_SIGNING_KEY=your_current_signing_key_here
QSTASH_NEXT_SIGNING_KEY=your_next_signing_key_here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 4. **Update Database Schema**
Add a `qstash_id` column to your `scheduled_messages` table:
```sql
ALTER TABLE scheduled_messages 
ADD COLUMN qstash_id TEXT;
```

## 🔧 **How It Works**

### **One-time Messages**
- Uses QStash `publishJSON` with delay
- Messages are sent exactly at the scheduled time
- No cron limitations

### **Recurring Messages**
- Uses QStash `schedules.create` with cron expressions
- Supports daily, weekly, monthly patterns
- Automatic retry on failure

### **Fallback**
- If QStash fails, falls back to manual processing
- No message loss

## 💰 **Cost Comparison**

| Service | Free Tier | Paid Tier | Limitations |
|---------|-----------|-----------|-------------|
| **Vercel Hobby** | $0 | $20/month | 1 cron job/day |
| **QStash** | 10K req/month | $0.50/10K req | None |
| **EasyCron** | Limited | $2.99/month | 100 cron jobs |

## 🧪 **Testing**

### **Local Testing**
```bash
# Test message processing (fallback mode)
curl -X POST http://localhost:3000/api/process-scheduled-messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-scheduler-api-key" \
  -d '{}'
```

### **Production Testing**
1. Schedule a message for 2-3 minutes from now
2. Wait for the scheduled time
3. Check message delivery in your chat system

## 🚀 **Deployment**

1. **Vercel Cron Removed**: The `vercel.json` has been updated to remove cron configuration
2. **Deploy**: Push to Vercel with QStash environment variables
3. **Verify**: Test message scheduling in production

## 📊 **Monitoring**

- QStash dashboard shows delivery status
- Failed deliveries are automatically retried
- Webhook logs available in QStash console

## 🔒 **Security**

- All webhooks are verified with signing keys
- API tokens are server-side only
- No client-side exposure of sensitive data
