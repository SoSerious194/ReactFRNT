import { BellIcon } from "lucide-react";
import React from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

// Navigation menu items data
const mainNavItems = [
  { label: "Dashboard", href: "#", active: false },
  { label: "Clients + Groups", href: "#", active: false },
  { label: "Training Hub", href: "#", active: true },
  { label: "Nutrition Hub", href: "#", active: false },
  { label: "Inbox", href: "#", active: false },
  { label: "AI Flows", href: "#", active: false },
];

const subNavItems = [
  { label: "Program Library", href: "#", active: true },
  { label: "Workout Library", href: "#", active: false },
  { label: "Exercise Library", href: "#", active: false },
  { label: "Video On-Demand", href: "#", active: false },
];

export const HeaderSection: React.FC = () => {
  return (
    <header className="w-full border-b border-solid">
      {/* Main navigation */}
      <div className="w-full h-[76px]">
        <div className="flex justify-between items-center h-11 mx-6 my-4">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex items-center mr-8">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <img
                  className="w-[17.5px] h-3.5"
                  alt="FitPro Logo"
                  src="https://c.animaapp.com/mbqrzacsv2XpmH/img/frame-11.svg"
                />
              </div>
              <span className="ml-3 font-bold text-xl text-gray-900">
                FitPro
              </span>
            </div>

            {/* Main navigation items */}
            <nav className="flex space-x-8">
              {mainNavItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={`font-medium text-base ${
                    item.active ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* User section */}
          <div className="flex items-center space-x-4">
            {/* Notification bell */}
            <div className="relative">
              <BellIcon className="h-[18px] w-[15.75px] text-gray-700" />
              <Badge className="absolute -top-1 left-3 w-3 h-3 p-0 bg-red-500 border-0" />
            </div>

            {/* User avatar */}
            <Avatar className="w-8 h-8">
              <AvatarImage
                src="https://c.animaapp.com/mbqrzacsv2XpmH/img/img-3.png"
                alt="User avatar"
              />
            </Avatar>
          </div>
        </div>
      </div>

      {/* Secondary navigation */}
      <div className="w-full h-[59px] bg-green-50 border-t border-green-200">
        <div className="mx-6 h-[34px] my-[13px]">
          <nav className="flex space-x-8">
            {subNavItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`font-medium text-base ${
                  item.active
                    ? "text-green-700 border-b-2 border-green-500 pb-2"
                    : "text-gray-600"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
