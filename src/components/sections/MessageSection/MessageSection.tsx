'use client';
import {
  MoreHorizontalIcon,
  PaperclipIcon,
  PhoneIcon,
  SendIcon,
  VideoIcon,
} from "lucide-react";
import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Message data for mapping
const messages = [
  {
    id: 1,
    sender: "Sarah Johnson",
    time: "2:30 PM",
    content: "Just finished my deadlift session! Hit a new PR of 185lbs! 💪",
    avatar: "https://c.animaapp.com/mbtb1be13lPm2M/img/img-4.png",
    isCurrentUser: false,
  },
  {
    id: 2,
    sender: "Mike Rodriguez",
    time: "2:32 PM",
    content: "Amazing work Sarah! That's incredible progress 🔥",
    avatar: "https://c.animaapp.com/mbtb1be13lPm2M/img/img-5.png",
    isCurrentUser: false,
  },
  {
    id: 3,
    sender: "You",
    time: "2:35 PM",
    content:
      "Congratulations Sarah! Your form has improved so much. Keep up the excellent work everyone! 👏",
    avatar: "https://c.animaapp.com/mbtb1be13lPm2M/img/img-10.png",
    isCurrentUser: true,
  },
  {
    id: 4,
    sender: "David Wilson",
    time: "2:40 PM",
    content:
      "Anyone up for a group session tomorrow morning? I'm thinking 7 AM?",
    avatar: "https://c.animaapp.com/mbtb1be13lPm2M/img/img-7.png",
    isCurrentUser: false,
  },
];

export default function MessageSection() {
  return (
    <div className="flex flex-col h-full w-full border-l bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-white border-b" style={{ minHeight: 97 }}>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
            <img
              className="w-5 h-4"
              alt="Group icon"
              src="https://c.animaapp.com/mbtb1be13lPm2M/img/frame-2.svg"
            />
          </div>

          <div className="ml-4">
            <h2 className="font-bold text-xl text-gray-900">
              Strength Training
            </h2>
            <p className="text-sm text-gray-500">24 members • 15 online</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="h-10 w-8">
            <PhoneIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-[34px]">
            <VideoIcon className="h-4 w-[18px]" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-8">
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-8 ${message.isCurrentUser ? "justify-end" : ""}`}
          >
            {!message.isCurrentUser && (
              <Avatar className="h-10 w-10 mr-3">
                <img
                  src={message.avatar}
                  alt={message.sender}
                  className="h-full w-full object-cover"
                />
              </Avatar>
            )}

            <div
              className={`flex flex-col ${message.isCurrentUser ? "items-end" : ""}`}
            >
              <div className="flex items-center mb-1">
                {!message.isCurrentUser ? (
                  <>
                    <span className="font-normal text-base text-gray-900">
                      {message.sender}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {message.time}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="mr-2 text-xs text-gray-500">
                      {message.time}
                    </span>
                    <span className="font-normal text-base text-gray-900">
                      {message.sender}
                    </span>
                  </>
                )}
              </div>

              <Card
                className={`p-3 max-w-[448px] border-0 ${
                  message.isCurrentUser
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-base">{message.content}</p>
              </Card>
            </div>

            {message.isCurrentUser && (
              <Avatar className="h-10 w-10 ml-3">
                <img
                  src={message.avatar}
                  alt={message.sender}
                  className="h-full w-full object-cover"
                />
              </Avatar>
            )}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <footer className="p-6 bg-white border-t pb-24">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-10 w-[30px] mr-4">
            <PaperclipIcon className="h-4 w-3.5" />
          </Button>

          <div className="flex-1">
            <Input
              className="h-[50px] border-gray-300"
              placeholder="Type a message..."
            />
          </div>

          <Button
            size="icon"
            className="h-12 w-10 ml-4 bg-green-500 hover:bg-green-600"
          >
            <SendIcon className="h-4 w-4 text-white" />
          </Button>
        </div>
      </footer>
    </div>
  );
};
