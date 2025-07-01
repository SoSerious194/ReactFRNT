import { ChatSection } from "@/components/sections/ChatSection";
import React from "react";
import { getClient, getConversationId } from "./action";
import { getUserId } from "./action";
import MessageSection from "@/components/sections/inbox/MessageSection";
import { SearchParamsType } from "@/types";

// Error component
const ErrorMessage = ({ message, retry }: { message: string; retry?: () => void }) => (
  <div className="flex flex-col items-center justify-center h-64 p-6">
    <div className="text-red-600 text-center mb-4">
      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c.77.833 1.732 2.5 1.732 2.5z"
        />
      </svg>
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p className="text-sm text-gray-600 mt-1">{message}</p>
    </div>
    {retry && (
      <button onClick={retry} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        Try Again
      </button>
    )}
  </div>
);

// Empty state component
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-64 p-6">
    <div className="text-gray-400 text-center">
      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-gray-600">No Messages</h3>
      <p className="text-sm text-gray-500 mt-1">{message}</p>
    </div>
  </div>
);

const MessagesPage = async ({ searchParams }: SearchParamsType) => {
  const { client: clientId } = await searchParams;

  if (!clientId) {
    return (
      <>
        <section className="flex-1 flex flex-col h-full">
          <EmptyState message="Please select a client to view messages" />
        </section>
        <aside className="w-[22%] flex-shrink-0 border-l border-gray-200">
          <ChatSection />
        </aside>
      </>
    );
  }

  const results = await Promise.allSettled([getConversationId(clientId as string), getUserId(), getClient(clientId as string)]);

  const [conversationResult, userResult, clientResult] = results;

  const errors = results
    .map((result, index) => ({ result, index }))
    .filter(({ result }) => result.status === "rejected")
    .map(({ result, index }) => {
      const operation = ["conversation", "user", "client"][index];
      return `Failed to load ${operation}: ${(result as PromiseRejectedResult).reason}`;
    });

  if (errors.length > 0) {
    return (
      <div className="flex h-full">
        <section className="flex-1 flex flex-col h-full">
          <ErrorMessage message={`Unable to load required data. ${errors.join(". ")}`} />
        </section>
        <aside className="w-[22%] flex-shrink-0 border-l border-gray-200">
          <ChatSection />
        </aside>
      </div>
    );
  }

  // Extract successful values
  const conversationId = conversationResult.status === "fulfilled" ? conversationResult.value : null;
  const userId = userResult.status === "fulfilled" ? userResult.value : null;
  const clientData = clientResult.status === "fulfilled" ? clientResult.value : null;

  // Handle specific data validation
  if (!clientData?.data) {
    return (
      <div className="flex h-full">
        <section className="flex-1 flex flex-col h-full">
          <ErrorMessage message="Client not found or access denied" />
        </section>
        <aside className="w-[22%] flex-shrink-0 border-l border-gray-200">
          <ChatSection />
        </aside>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex h-full">
        <section className="flex-1 flex flex-col h-full">
          <EmptyState message="No conversation found for this client" />
        </section>
        <aside className="w-[22%] flex-shrink-0 border-l border-gray-200">
          <ChatSection />
        </aside>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex h-full">
        <section className="flex-1 flex flex-col h-full">
          <ErrorMessage message="User authentication required" />
        </section>
        <aside className="w-[22%] flex-shrink-0 border-l border-gray-200">
          <ChatSection />
        </aside>
      </div>
    );
  }

  return (
    <>
      <section className="flex-1 flex flex-col h-full">
        <MessageSection key={conversationId} client={clientData.data} conversationId={conversationId} userId={userId} />
      </section>
      <aside className="w-[22%] flex-shrink-0 border-l border-gray-200">
        <ChatSection />
      </aside>
    </>
  );
};

export default MessagesPage;
