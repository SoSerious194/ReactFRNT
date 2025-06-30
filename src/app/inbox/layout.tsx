import React, { ReactNode } from "react";

const InboxLayout = ({  clients, messages }: { clients: ReactNode; messages: ReactNode }) => {
  return (
    <div className="flex h-screen">
      {clients}
      {messages}
    </div>
  );
};

export default InboxLayout;
