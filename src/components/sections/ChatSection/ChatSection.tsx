'use client';
import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

// Member data for mapping
const members = [
  {
    id: 1,
    name: "Sarah Johnson",
    image: "https://c.animaapp.com/mbtb1be13lPm2M/img/img-4.png",
    status: "online",
    type: "1:1 Client",
    badgeColor: "blue",
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    image: "https://c.animaapp.com/mbtb1be13lPm2M/img/img-5.png",
    status: "online",
    type: "Paid Member",
    badgeColor: "green",
  },
  {
    id: 3,
    name: "Emily Chen",
    image: "https://c.animaapp.com/mbtb1be13lPm2M/img/img-6.png",
    status: "offline",
    type: "Groupie",
    badgeColor: "purple",
  },
  {
    id: 4,
    name: "David Wilson",
    image: "https://c.animaapp.com/mbtb1be13lPm2M/img/img-7.png",
    status: "online",
    type: "Paid Member",
    badgeColor: "green",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    image: "https://c.animaapp.com/mbtb1be13lPm2M/img/img-8.png",
    status: "offline",
    type: "1:1 Client",
    badgeColor: "blue",
  },
  {
    id: 6,
    name: "James Parker",
    image: "https://c.animaapp.com/mbtb1be13lPm2M/img/img-9.png",
    status: "online",
    type: "Groupie",
    badgeColor: "purple",
  },
];

export default function ChatSection() {
  return (
    <div className="w-80 h-full border-l border-solid">
      <div className="border-b border-solid">
        <div className="p-6 pb-0">
          <ToggleGroup
            type="single"
            defaultValue="all"
            className="bg-gray-100 rounded-lg h-12 w-full flex"
          >
            <ToggleGroupItem
              value="all"
              className="h-12 flex-1 rounded-md text-base data-[state=on]:bg-white data-[state=on]:text-green-700 data-[state=on]:font-bold text-gray-600"
            >
              <span className="[font-family:'Inter',Helvetica]">
                Members
              </span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="online"
              className="h-12 flex-1 rounded-md text-base data-[state=on]:bg-white data-[state=on]:text-green-700 data-[state=on]:font-bold text-gray-600"
            >
              <span className="[font-family:'Inter',Helvetica]">
                Forums
              </span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <div className="pt-4">
        {members.map((member) => (
          <Card
            key={member.id}
            className="mx-4 mb-4 rounded-lg border-0 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center p-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={member.image}
                    alt={member.name}
                    className="rounded-full"
                  />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div
                  className={`absolute w-4 h-4 bottom-0 right-0 ${
                    member.status === "online" ? "bg-green-500" : "bg-gray-400"
                  } rounded-full border-2 border-solid border-white`}
                />
              </div>
              <div className="ml-3">
                <div className="font-medium text-base text-gray-900 [font-family:'Inter',Helvetica]">
                  {member.name}
                </div>
                <Badge
                  className={`mt-1 bg-${member.badgeColor}-100 text-${member.badgeColor}-800 hover:bg-${member.badgeColor}-100 border-0`}
                  variant="outline"
                >
                  <span className="font-medium text-xs [font-family:'Inter',Helvetica]">
                    {member.type}
                  </span>
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
