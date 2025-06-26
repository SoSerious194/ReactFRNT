import ChatSection from "@/components/sections/ChatSection/ChatSection";
import { getClients, getConversationId, getUserId } from "./action";
import ClientListingSection from "@/components/sections/inbox/ClientListingSection/ClientListingSection";
import MessageSection from "@/components/sections/inbox/MessageSection/MessageSection";
import { SearchParamsType } from "@/types";

export default async function InboxPage({searchParams}: SearchParamsType) {

  const { client: clientId } = await searchParams;

  const { data } = await getClients();
  const conversationId = await getConversationId(clientId as string);
  const userId = await getUserId();

  const client = data.find((client) => {
    return client.id === clientId
  })


  return (
    <div className="flex h-screen">
      <aside className="w-80 flex-shrink-0">
        <ClientListingSection clients={data} />
      </aside>
      <section className="flex-1 flex flex-col h-full">
        {client && conversationId && userId && <MessageSection key={conversationId} client={client} conversationId={conversationId } userId={userId} />}
      </section>
      <aside className="w-[22%] flex-shrink-0">
        <ChatSection />
      </aside>
    </div>
  );
}
