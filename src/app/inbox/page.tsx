"use client";

import MemberListSection from "@/components/sections/MemberListSection/MemberListSection";
import MessageSection from "@/components/sections/MessageSection/MessageSection";
import ChatSection from "@/components/sections/ChatSection/ChatSection";
import MessageSchedulerSection from "@/components/sections/MessageSchedulerSection";
import AutomatedMessageSettingsSection from "@/components/sections/AutomatedMessageSettingsSection/AutomatedMessageSettingsSection";
import { ChatProvider } from "@/lib/chatContext";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Calendar, Settings } from "lucide-react";

const supabase = createClient();

export default function InboxPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("chat");

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

  return (
    <ChatProvider coachId={user.id}>
      <div className="flex h-[calc(100vh-82px)] overflow-hidden">
        <aside className="w-80 flex-shrink-0 border-r border-gray-200">
          <MemberListSection />
        </aside>
        <section className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b px-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="scheduler" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Message Scheduler
                </TabsTrigger>
                <TabsTrigger value="ai-settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  AI Settings
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0">
              <MessageSection />
            </TabsContent>
            
            <TabsContent value="scheduler" className="flex-1 flex flex-col min-h-0">
              <MessageSchedulerSection />
            </TabsContent>
            
            <TabsContent value="ai-settings" className="flex-1 flex flex-col min-h-0">
              <AutomatedMessageSettingsSection />
            </TabsContent>
          </Tabs>
        </section>
        <aside className="w-[22%] flex-shrink-0 border-l border-gray-200">
          <ChatSection />
        </aside>
      </div>
    </ChatProvider>
  );
}
