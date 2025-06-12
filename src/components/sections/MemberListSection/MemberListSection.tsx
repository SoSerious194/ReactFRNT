'use client';
import { PlusIcon, SearchIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MemberListSection() {
  // Group data for mapping
  const groups = [
    {
      id: 1,
      name: "Strength Training",
      members: 24,
      lastMessageTime: "2h ago",
      color: "bg-green-500",
      isActive: true,
      icon: "https://c.animaapp.com/mbtb1be13lPm2M/img/frame-2.svg",
    },
    {
      id: 2,
      name: "Cardio Warriors",
      members: 18,
      lastMessageTime: "1d ago",
      color: "bg-purple-500",
      isActive: false,
      icon: "https://c.animaapp.com/mbtb1be13lPm2M/img/frame-3.svg",
    },
    {
      id: 3,
      name: "Nutrition Support",
      members: 32,
      lastMessageTime: "3h ago",
      color: "bg-orange-500",
      isActive: false,
      icon: "https://c.animaapp.com/mbtb1be13lPm2M/img/frame-5.svg",
    },
    {
      id: 4,
      name: "Marathon Prep",
      members: 12,
      lastMessageTime: "5h ago",
      color: "bg-blue-500",
      isActive: false,
      icon: "https://c.animaapp.com/mbtb1be13lPm2M/img/frame-1.svg",
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
              Groups
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
              placeholder="SearchIcon groups"
            />
          </div>
        </div>
      </header>

      {/* Groups List */}
      <div className="w-full">
        {groups.map((group) => (
          <div
            key={group.id}
            className={`w-full h-[92px] ${group.isActive ? "bg-green-50 border-r-4 border-r-green-500" : ""}`}
          >
            <div className="flex p-4 items-center">
              {/* Group Icon */}
              <div
                className={`w-12 h-12 rounded-full ${group.color} flex items-center justify-center mr-4`}
              >
                <img
                  className="w-4 h-4"
                  alt={`${group.name} icon`}
                  src={group.icon}
                />
              </div>

              {/* Group Info */}
              <div className="flex flex-col">
                <span className="font-normal text-base text-gray-900 leading-6">
                  {group.name}
                </span>
                <span className="font-normal text-sm text-gray-500 leading-5">
                  {group.members} members
                </span>
                <span className="font-normal text-xs text-gray-400 leading-4">
                  Last message {group.lastMessageTime}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
