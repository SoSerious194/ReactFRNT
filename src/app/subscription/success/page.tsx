"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For mobile apps, you might want to send a message back to the app
    // or redirect to a deep link
    if (sessionId) {
      console.log("Payment successful with session ID:", sessionId);
      
      // You can add logic here to:
      // 1. Send a message to the mobile app
      // 2. Redirect to a deep link
      // 3. Show a success message
      
      // Example: Send message to mobile app
      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SUBSCRIPTION_SUCCESS',
          sessionId: sessionId
        }));
      }
      
      // Example: Redirect to mobile app deep link
      // window.location.href = `yourapp://subscription/success?sessionId=${sessionId}`;
    }
    
    setLoading(false);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for subscribing to PTFlow. Your subscription is now active.
        </p>
        
        {sessionId && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500">
              Session ID: {sessionId}
            </p>
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          <p>You can now close this window and return to the app.</p>
          <p>Your subscription will automatically renew each month.</p>
        </div>
        
        {/* Auto-close after 5 seconds */}
        <div className="mt-6">
          <p className="text-xs text-gray-400">
            This window will close automatically in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
