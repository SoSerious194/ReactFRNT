'use client';
import { PlusIcon, SearchIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MemberListSection() {
  // Client data for mapping
  const clients = [
    {
      id: 1,
      name: "Jane Doe",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      isActive: true,
    },
    {
      id: 2,
      name: "John Smith",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      isActive: false,
    },
    {
      id: 3,
      name: "Emily Johnson",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      isActive: false,
    },
    {
      id: 4,
      name: "Michael Brown",
      avatar: "https://randomuser.me/api/portraits/men/65.jpg",
      isActive: false,
    },
    {
      id: 5,
      name: "Olivia Lee",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      isActive: false,
    },
  ];

  return (
    <aside className="w-80 h-full border-r border-solid">
      {/* Header Section */}
      <header className="border-b border-solid">
        <div className="p-6 pb-5">
          {/* Title and Add Button */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-xl text-gray-900 font-sans">
              Clients
            </h2>
            <Button size="sm" className="w-7 h-10 p-0 bg-green-500">
              <PlusIcon className="h-3 w-3 text-white" />
            </Button>
          </div>

          {/* SearchIcon Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-[11px] h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 h-[38px] text-sm border-gray-300"
              placeholder="Search Clients"
            />
          </div>
        </div>
      </header>

      {/* Clients List */}
      <div className="w-full">
        {clients.map((client) => (
          <div
            key={client.id}
            className={`w-full h-[72px] ${client.isActive ? "bg-green-50 border-r-4 border-r-green-500" : ""}`}
          >
            <div className="flex p-4 items-center">
              {/* Client Avatar */}
              <img
                className="w-12 h-12 rounded-full object-cover mr-4"
                alt={client.name}
                src={client.avatar}
              />
              {/* Client Name */}
              <span className="font-normal text-base text-gray-900 leading-6">
                {client.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
