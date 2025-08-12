# Supabase Edge Functions for Recurring Messages

## Overview

This approach uses Supabase Edge Functions to process recurring messages, which is more reliable and integrated than external cron services.

## Benefits

✅ **Runs on Supabase infrastructure** - same as your database  
✅ **No external dependencies** - everything in one place  
✅ **Reliable** - Supabase's infrastructure  
✅ **Cost-effective** - included in Supabase plans  
✅ **Easy deployment** - simple CLI commands  
✅ **Integrated** - direct database access  

## Setup Steps

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Initialize Supabase (if not already done)

```bash
supabase init
```

### 3. Create the Edge Function

```bash
supabase functions new process-recurring-messages
```

### 4. Deploy the Function

```bash
supabase functions deploy process-recurring-messages
```

### 5. Set Environment Variables

In your Supabase Dashboard (https://supabase.com/dashboard/project/skgzwffygckgqquatqpr/settings/functions), add these environment variables:

- `SERVER_URL` = `https://skgzwffygckgqquatqpr.supabase.co`
- `SERVER_SERVICE_ROLE_KEY` = `[your-service-role-key]`
- `NEXT_PUBLIC_STREAM_KEY` = `7hhbp7473rqt`
- `STREAM_SECRET` = `mn3jh5vxtfcbuhr6jzfgpmhwvqcs33gped56kvxussfvwy7ftpemxuark7w3badu`

> **Note**: We no longer need `SCHEDULER_API_KEY` since we're using Supabase's built-in cron system.

## How It Works

1. **PostgreSQL cron job runs every 3 minutes** (using pg_cron)
2. **Calls Edge Function** via HTTP POST with anon key
3. **Edge Function queries database** for active recurring messages
4. **Filters messages** that are due to be sent
5. **Sends messages directly to GetStream** from the Edge Function
6. **Records delivery status** in the database
7. **Updates last sent timestamp** for recurring messages

## Setting Up the Cron Trigger

### Step 1: Store Credentials in Vault

Run this SQL in your Supabase SQL Editor:

```sql
-- Store project URL and anon key in Supabase Vault
SELECT vault.create_secret('https://skgzwffygckgqquatqpr.supabase.co', 'project_url');
SELECT vault.create_secret('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZ3p3ZmZ5Z2NrZ3FxdWF0cXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3Mzc2MDcsImV4cCI6MjA2NTMxMzYwN30.rjOje8137cW6HhZJRIz4zD9XX2puyIfT_IEit4H4V-w', 'anon_key');
```

### Step 2: Create the Cron Job

```sql
-- Schedule the Edge Function to run every 3 minutes
SELECT cron.schedule(
  'process-recurring-messages',
  '*/3 * * * *', -- every 3 minutes
  $$
  SELECT
    net.http_post(
      url:= (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/process-recurring-messages',
      headers:=jsonb_build_object(
        'Content-type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key')
      ),
      body:=jsonb_build_object('scheduled_at', now())
    ) as request_id;
  $$
);
```

### Step 3: Verify the Cron Job

```sql
-- Check all scheduled cron jobs
SELECT * FROM cron.job;

-- Check the specific job we created
SELECT * FROM cron.job WHERE jobname = 'process-recurring-messages';
```

## Environment Variables

### Supabase Edge Function
```
SCHEDULER_API_KEY=42f176c5023e26e39d7df0d1293882a1
SERVER_URL=https://skgzwffygckgqquatqpr.supabase.co
SERVER_SERVICE_ROLE_KEY=[your-service-role-key]
NEXT_PUBLIC_STREAM_KEY=7hhbp7473rqt
STREAM_SECRET=mn3jh5vxtfcbuhr6jzfgpmhwvqcs33gped56kvxussfvwy7ftpemxuark7w3badu
```

## Architecture

```
PostgreSQL Cron (pg_cron)
    ↓ (every 3 minutes)
HTTP POST to Edge Function
    ↓ (with anon key)
Supabase Edge Function
    ↓ (queries database)
Database (scheduled_messages)
    ↓ (filters due messages)
GetStream API (direct)
    ↓ (sends messages)
Chat Messages
```

## Monitoring

### Supabase Dashboard
- Go to **Functions** → **process-recurring-messages**
- View **Logs** and **Invocation history**

### Your App Logs
- Monitor GetStream for message delivery
- Check Supabase function logs for processing details

## Testing

1. **Create a 5-minute recurring message**
2. **Wait 3-6 minutes** for the cron job to trigger
3. **Check Supabase function logs** for processing
4. **Check your chat inbox** for messages

## Troubleshooting

### Function Not Running
1. Check if cron service is calling the function
2. Verify environment variables are set
3. Check Supabase function logs

### Messages Not Sending
1. Verify `SCHEDULER_API_KEY` matches in both places
2. Check if messages are marked as "active"
3. Verify target users exist
4. Check Next.js API logs

### Database Connection Issues
1. Verify Supabase service role key
2. Check database permissions
3. Ensure tables exist and are accessible

## Advantages Over Other Solutions

- **No Vercel limitations** - runs on Supabase infrastructure
- **Direct database access** - no API calls needed for queries
- **Better performance** - closer to your data
- **Integrated monitoring** - all logs in Supabase dashboard
- **Cost-effective** - included in Supabase plan
