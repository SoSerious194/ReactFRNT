"use client";
import { PlusIcon, SearchIcon, UserIcon } from "lucide-react";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientType } from "@/types/client";

export default function ClientListingSection({ clients }: { clients: ClientType[] }) {

  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeClient, setActiveClient] = useState<string | null>(searchParams.get("client"));

  const handleClientSelect = (clientId: string) => {
    setActiveClient(clientId);
    const params = new URLSearchParams(searchParams);
    params.set("client", clientId);
    router.push(`?${params.toString()}`);
  };

  return (
    <aside className="w-80 h-full border-r border-solid">
      {/* Header Section */}
      <header className="border-b border-solid">
        <div className="p-6 pb-5">
          {/* Title and Add Button */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-xl text-gray-900 font-sans">Clients</h2>
            <Button size="sm" className="w-7 h-10 p-0 bg-green-500">
              <PlusIcon className="h-3 w-3 text-white" />
            </Button>
          </div>
          {/* SearchIcon Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-[11px] h-4 w-4 text-gray-400" />
            <Input className="pl-10 h-[38px] text-sm border-gray-300" placeholder="Search Clients" />
          </div>
        </div>
      </header>

      {/* Clients List */}
      <div className="w-full">
        {clients?.map((client) => (
          <div
            key={client.id}
            className={`w-full h-[72px] cursor-pointer  transition-colors ${activeClient === client.id ? "bg-green-50 border-r-4 border-r-green-500" : ""}`}
            onClick={() => handleClientSelect(client.id)}
          >
            <div className="flex p-4 items-center">
              {/* Client Avatar */}
              {client.profile_image_url && <img className="w-12 h-12 rounded-full object-cover mr-4" alt={"User Avatar"} src={client.profile_image_url} />}
              {!client.profile_image_url && (
                <div className="w-12 h-12 rounded-full object-cover mr-4 bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
              {/* Client Name */}
              <span className="font-normal text-base text-gray-900 leading-6">{client.full_name}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
