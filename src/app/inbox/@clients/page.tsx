import ClientListingSection from "@/components/sections/inbox/ClientListingSection/ClientListingSection";
import React from "react";
import { getClients } from "../action";

const ClientListingPage = async () => {
  const { data } = await getClients();

  
  return (
    <aside className="w-80 flex-shrink-0">
      <ClientListingSection clients={data} />
    </aside>
  );
};

export default ClientListingPage;
