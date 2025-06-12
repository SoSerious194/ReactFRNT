'use client';
import React from "react";
import ChatSection from "@/components/sections/ChatSection/ChatSection";
import GroupHeaderSection from "@/components/sections/GroupHeaderSection/GroupHeaderSection";
import MemberListSection from "@/components/sections/MemberListSection/MemberListSection";
import MessageSection from "@/components/sections/MessageSection/MessageSection";

export default function GroupsPage() {
  return (
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
  );
}

