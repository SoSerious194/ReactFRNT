-- Test 1: Check if vault secrets are set
SELECT 
  name,
  CASE 
    WHEN decrypted_secret IS NOT NULL THEN '✅ SET'
    ELSE '❌ NOT SET'
  END as status
FROM vault.decrypted_secrets 
WHERE name IN ('project_url', 'anon_key');

-- Test 2: Check if cron job exists
SELECT 
  jobname,
  schedule,
  CASE 
    WHEN active = true THEN '✅ ACTIVE'
    ELSE '❌ INACTIVE'
  END as status
FROM cron.job 
WHERE jobname = 'process-recurring-messages';

-- Test 3: Check scheduled messages in database
SELECT 
  id,
  title,
  schedule_type,
  status,
  is_active,
  last_sent_at,
  CASE 
    WHEN last_sent_at IS NULL THEN 'Never sent'
    ELSE last_sent_at::text
  END as last_sent
FROM scheduled_messages 
WHERE status = 'active' AND is_active = true;

-- Test 4: Manually trigger the cron job (for testing)
SELECT
  net.http_post(
    url:= (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/process-recurring-messages',
    headers:=jsonb_build_object(
      'Content-type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key')
    ),
    body:=jsonb_build_object('test', true, 'manual_trigger', now())
  ) as request_id;
