'use client';
import React from "react";
import ChatSection from "@/components/sections/ChatSection/ChatSection";
import GroupHeaderSection from "@/components/sections/GroupHeaderSection/GroupHeaderSection";
import MemberListSection from "@/components/sections/MemberListSection/MemberListSection";
import MessageSection from "@/components/sections/MessageSection/MessageSection";
import { ChatProvider } from "@/lib/chatContext";
import { useAuth } from "@/lib/useAuth";

export default function GroupsPage() {
  const { user, loading } = useAuth();

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
          <p className="text-gray-600">Please log in to access the groups.</p>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider coachId={user.id}>
      <div className="flex flex-col">
        <div className="flex w-full flex-grow">
          <aside className="w-80 flex-shrink-0">
            <MemberListSection />
          </aside>
          <section className="flex-1 flex flex-col">
            <MessageSection />
          </section>
          <aside className="w-[22%] flex-shrink-0">
            <ChatSection />
          </aside>
        </div>
      </div>
    </ChatProvider>
  );
}

