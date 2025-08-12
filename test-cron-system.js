const https = require('https');

// Test the Edge Function directly
function testEdgeFunction() {
  console.log('🧪 Testing Edge Function...');
  
  const options = {
    hostname: 'skgzwffygckgqquatqpr.supabase.co',
    port: 443,
    path: '/functions/v1/process-recurring-messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZ3p3ZmZ5Z2NrZ3FxdWF0cXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3Mzc2MDcsImV4cCI6MjA2NTMxMzYwN30.rjOje8137cW6HhZJRIz4zD9XX2puyIfT_IEit4H4V-w'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`✅ Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📋 Response:', JSON.parse(data));
      console.log('\n');
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error:', e);
  });

  req.end();
}

// Test the cron job manually
function testCronJob() {
  console.log('⏰ Testing Cron Job (Manual Trigger)...');
  
  const options = {
    hostname: 'skgzwffygckgqquatqpr.supabase.co',
    port: 443,
    path: '/rest/v1/rpc/test_cron_trigger',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZ3p3ZmZ5Z2NrZ3FxdWF0cXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3Mzc2MDcsImV4cCI6MjA2NTMxMzYwN30.rjOje8137cW6HhZJRIz4zD9XX2puyIfT_IEit4H4V-w'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`✅ Cron Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📋 Cron Response:', data);
      console.log('\n');
    });
  });

  req.on('error', (e) => {
    console.error('❌ Cron Error:', e);
  });

  req.end();
}

// Run tests
console.log('🚀 Testing Supabase Cron System\n');
testEdgeFunction();

// Wait a bit, then test cron
setTimeout(() => {
  testCronJob();
}, 2000);
