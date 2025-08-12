-- Create a test message that should be sent immediately
INSERT INTO scheduled_messages (
  id,
  coach_id,
  title,
  content,
  template_id,
  schedule_type,
  start_date,
  start_time,
  target_type,
  target_user_ids,
  status,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'ceebf0b0-93c8-4213-b2fb-4eef6414bd32', -- coach ID
  'Test Message - Should Send Immediately',
  'This is a test message to verify GetStream integration is working!',
  NULL,
  '5min',
  CURRENT_DATE,
  CURRENT_TIME,
  'specific',
  ARRAY['5226116a-a31b-4927-a296-2c0a7ec3ee75'::uuid], -- target user ID
  'active',
  true,
  NOW(),
  NOW()
);

-- Check the test message was created
SELECT 
  id,
  title,
  schedule_type,
  status,
  is_active,
  last_sent_at
FROM scheduled_messages 
WHERE title = 'Test Message - Should Send Immediately';
