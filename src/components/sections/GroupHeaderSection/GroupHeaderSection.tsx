'use client';
import { BellIcon } from "lucide-react";
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Navigation menu items data
const navigationItems = [
  { name: "Dashboard", href: "#", active: false },
  { name: "Clients + Groups", href: "#", active: true },
  { name: "Training Hub", href: "#", active: false },
  { name: "Nutrition Hub", href: "#", active: false },
  { name: "Inbox", href: "#", active: false },
  { name: "AI Flows", href: "#", active: false },
];

export default function GroupHeaderSection() {
  return (
    <header className="w-full border-b border-solid">
      {/* Main navigation */}
      <div className="w-full h-[76px] bg-white">
        <div className="h-11 mx-6 my-4 flex justify-between items-center">
          {/* Logo and navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <img
                  className="w-[17.5px] h-3.5"
                  alt="FitPro Logo"
                  src="https://c.animaapp.com/mbtb1be13lPm2M/img/frame-4.svg"
                />
              </div>
              <span className="ml-3 font-bold text-xl text-gray-900">
                FitPro
              </span>
            </div>

            {/* Navigation links */}
            <nav className="flex items-center gap-[31px]">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`font-medium text-base ${
                    item.active ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          {/* User section */}
          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <div className="relative">
              <div className="w-8 h-11 flex items-center justify-center">
                <BellIcon className="w-4 h-[18px]" />
                <div className="absolute w-3 h-3 -top-1 right-0 bg-red-500 rounded-full" />
              </div>
            </div>

            {/* User avatar */}
            <div
              className="w-8 h-8 rounded-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url(https://c.animaapp.com/mbtb1be13lPm2M/img/img-10.png)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="w-full h-[59px] bg-green-50 border-t border-green-200">
        <div className="mx-6 my-[13px]">
          <Tabs defaultValue="groups" className="w-[139px]">
            <TabsList className="bg-transparent p-0 h-[34px] gap-[31px]">
              <TabsTrigger
                value="clients"
                className="px-0 data-[state=inactive]:bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium text-base text-gray-600 data-[state=active]:text-green-700 h-[34px] rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-500"
              >
                Clients
              </TabsTrigger>
              <TabsTrigger
                value="groups"
                className="px-0 data-[state=inactive]:bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium text-base text-gray-600 data-[state=active]:text-green-700 h-[34px] rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-500"
              >
                Groups
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  );
};
