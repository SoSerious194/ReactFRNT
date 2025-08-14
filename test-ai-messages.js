const { EventDetectionService } = require('./src/lib/eventDetectionService.ts');
const { AIMessageService } = require('./src/lib/aiMessageService.ts');

async function testAIMessageSystem() {
  console.log('🧪 Testing AI Message System...');
  
  try {
    // Step 1: Run event detection
    console.log('1️⃣ Running event detection...');
    await EventDetectionService.runAllDetection();
    
    // Step 2: Process pending events
    console.log('2️⃣ Processing pending events...');
    const result = await AIMessageService.processPendingEvents();
    
    console.log('✅ Test completed!');
    console.log('Results:', result);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAIMessageSystem();
