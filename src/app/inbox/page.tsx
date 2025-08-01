'use client';

import MemberListSection from '@/components/sections/MemberListSection/MemberListSection';
import MessageSection from '@/components/sections/MessageSection/MessageSection';
import ChatSection from '@/components/sections/ChatSection/ChatSection';
import { ChatProvider } from '@/lib/chatContext';
import { useAuth } from '@/lib/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const supabase = createClient();

export default function InboxPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the inbox.</p>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider coachId={user.id}>
      <div className="flex h-screen">
        {/* Logout Button */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>

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
    </ChatProvider>
  );
} 