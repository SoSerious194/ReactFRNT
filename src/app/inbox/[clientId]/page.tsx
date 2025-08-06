"use client";

import MemberListSection from "@/components/sections/MemberListSection/MemberListSection";
import MessageSection from "@/components/sections/MessageSection/MessageSection";
import ChatSection from "@/components/sections/ChatSection/ChatSection";
import { ChatProvider } from "@/lib/chatContext";
import { useAuth } from "@/lib/useAuth";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";

const supabase = createClient();

interface InboxClientPageProps {
  params: Promise<{
    clientId: string;
  }>;
}

export default function InboxClientPage({ params }: InboxClientPageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clientName, setClientName] = useState<string>("");
  const [isValidClient, setIsValidClient] = useState<boolean>(false);

  // Unwrap the params Promise
  const { clientId } = use(params);

  useEffect(() => {
    if (user && clientId) {
      // Verify the client exists and belongs to this coach
      const verifyClient = async () => {
        try {
          const { data: client, error } = await supabase
            .from("users")
            .select("id, full_name, coach")
            .eq("id", clientId)
            .eq("coach", user.id)
            .single();

          if (error || !client) {
            console.error("Client not found or unauthorized:", error);
            router.push("/inbox");
            return;
          }

          setClientName(client.full_name || "Unknown Client");
          setIsValidClient(true);
        } catch (error) {
          console.error("Error verifying client:", error);
          router.push("/inbox");
        }
      };

      verifyClient();
    }
  }, [user, clientId, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">Please log in to access the inbox.</p>
        </div>
      </div>
    );
  }

  if (!isValidClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client chat...</p>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider coachId={user.id} selectedClientId={clientId}>
      <div className="flex h-[calc(100vh-82px)] overflow-hidden">
        <aside className="w-80 flex-shrink-0 border-r border-gray-200">
          <MemberListSection />
        </aside>
        <section className="flex-1 flex flex-col min-h-0">
          <MessageSection />
        </section>
        <aside className="w-[22%] flex-shrink-0 border-l border-gray-200">
          <ChatSection />
        </aside>
      </div>
    </ChatProvider>
  );
}
