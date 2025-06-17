import MemberListSection from '@/components/sections/MemberListSection/MemberListSection';
import MessageSection from '@/components/sections/MessageSection/MessageSection';
import ChatSection from '@/components/sections/ChatSection/ChatSection';

export default function InboxPage() {
  return (
    
    <div className="flex h-screen">
      <aside className="w-80 flex-shrink-0">
        <MemberListSection />
      </aside>
      <section className="flex-1 flex flex-col h-full">
        <MessageSection />
      </section>
      <aside className="w-[22%] flex-shrink-0">
        <ChatSection />
      </aside>
    </div>
  );
} 