"use client";
import { PlusIcon, SearchIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/lib/chatContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MemberListSection() {
  const { users, selectedUser, selectUser, isLoading } = useChat();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

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

          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-[11px] h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 h-[38px] text-sm border-gray-300"
              placeholder="Search Clients"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Clients List */}
      <div className="w-full">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            Loading clients...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? "No clients found" : "No clients assigned"}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`w-full h-[72px] cursor-pointer hover:bg-gray-50 ${
                selectedUser?.id === user.id
                  ? "bg-green-50 border-r-4 border-r-green-500"
                  : ""
              }`}
              onClick={() => selectUser(user)}
            >
              <div className="flex p-4 items-center">
                {/* Client Avatar */}
                <Avatar className="w-12 h-12 mr-4">
                  <AvatarImage
                    src={user.profile_image_url || undefined}
                    alt={user.full_name || "User"}
                  />
                  <AvatarFallback>
                    {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Client Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-normal text-base text-gray-900 leading-6 truncate">
                    {user.full_name || user.email || "Unknown User"}
                  </div>
                  {user.email && (
                    <div className="text-xs text-gray-500">
                      Email: {user.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
