"use client";

import { useEffect } from "react";
import { XCircle } from "lucide-react";

export default function SubscriptionCancelPage() {
  useEffect(() => {
    // For mobile apps, you might want to send a message back to the app
    if ((window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({
        type: 'SUBSCRIPTION_CANCELLED'
      }));
    }
    
    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      window.close();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6">
          <XCircle className="h-16 w-16 text-red-600 mx-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your subscription checkout was cancelled. No charges were made.
        </p>
        
        <div className="text-sm text-gray-500">
          <p>You can try subscribing again anytime from the app.</p>
          <p>This window will close automatically.</p>
        </div>
      </div>
    </div>
  );
}
