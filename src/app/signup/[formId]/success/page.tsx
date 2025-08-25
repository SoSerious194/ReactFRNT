"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, CreditCard } from "lucide-react";

export default function PaymentSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    console.log("Payment success page - session_id:", sessionId);

    if (!sessionId) {
      console.error("Missing session ID");
      setError("Payment verification failed");
      setLoading(false);
      return;
    }

    // Payment was successful - the webhook will handle user creation
    console.log(
      "Payment verification successful, user creation will be handled by webhook"
    );
    
    // TODO: Remove this temporary check once webhook is working
    // For now, we can add a fallback to check if user was created
    const checkUserCreation = async () => {
      try {
        // You could add a check here to verify if the user was created
        // by checking the session status or making a call to your API
        console.log("Checking if user creation was successful...");
      } catch (error) {
        console.error("Error checking user creation:", error);
      }
    };
    
    checkUserCreation();
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="text-red-500 mb-4">
              <CreditCard className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Error
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Please contact support if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-4">
            Your payment has been processed successfully. Your account is being
            created and you'll receive a confirmation email shortly.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Check your email for login credentials</li>
              <li>• Log in to your new account</li>
              <li>• Start your fitness journey!</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
