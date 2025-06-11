'use client';
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Client data for mapping
const clients = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    avatar: "https://c.animaapp.com/mbsjcwsyX9IUAl/img/img.png",
    lastWorkout: "2024-01-15",
    lastLogin: "2024-01-16",
    criticalStatus: { level: "High", color: "red" },
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    email: "mike.rodriguez@email.com",
    avatar: "https://c.animaapp.com/mbsjcwsyX9IUAl/img/img-1.png",
    lastWorkout: "2024-01-16",
    lastLogin: "2024-01-17",
    criticalStatus: { level: "Medium", color: "yellow" },
  },
  {
    id: 3,
    name: "Emily Chen",
    email: "emily.chen@email.com",
    avatar: "https://c.animaapp.com/mbsjcwsyX9IUAl/img/img-2.png",
    lastWorkout: "2024-01-17",
    lastLogin: "2024-01-17",
    criticalStatus: { level: "Low", color: "green" },
  },
  {
    id: 4,
    name: "David Wilson",
    email: "david.wilson@email.com",
    avatar: "https://c.animaapp.com/mbsjcwsyX9IUAl/img/img-3.png",
    lastWorkout: "2024-01-14",
    lastLogin: "2024-01-15",
    criticalStatus: { level: "High", color: "red" },
  },
  {
    id: 5,
    name: "Lisa Thompson",
    email: "lisa.thompson@email.com",
    avatar: "https://c.animaapp.com/mbsjcwsyX9IUAl/img/img-4.png",
    lastWorkout: "2024-01-16",
    lastLogin: "2024-01-17",
    criticalStatus: { level: "Medium", color: "yellow" },
  },
];

// Filter tabs data
const filterTabs = [
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending" },
  { id: "inactive-on", label: "Inactive (On Roster)" },
  { id: "inactive-off", label: "Inactive (Off Roster)" },
];

export const ClientsListSection = () => {
  const [activeTab, setActiveTab] = useState("active");

  return (
    <section className="w-full max-w-[1280px] mx-auto py-8 px-5">
      <div className="space-y-6">
        {/* Header with title and add button */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 font-['Inter',Helvetica]">
            Clients
          </h1>

          <Button className="bg-green-500 hover:bg-green-600 text-white">
            <PlusIcon className="h-3.5 w-3.5 mr-2" />
            Add New Client
          </Button>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-[448px]">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 h-[50px] border-gray-300 bg-white rounded-lg"
              placeholder="Search clients"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="bg-gray-100 rounded-lg w-full max-w-[512px] h-11 flex items-center p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-9 px-4 flex items-center justify-center rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-green-700 shadow-[0px_1px_2px_#0000000d]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="font-medium text-sm font-['Inter',Helvetica]">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Clients table */}
        <Card className="border shadow-[0px_1px_2px_#0000000d] overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 h-14">
                  <TableHead className="w-16">
                    <Checkbox className="rounded-[1px] border-[0.5px] border-black" />
                  </TableHead>
                  <TableHead className="w-[371px]">
                    <span className="font-normal text-gray-900">Client</span>
                  </TableHead>
                  <TableHead className="w-[199px]">
                    <span className="font-normal text-gray-900">
                      Last Workout
                    </span>
                  </TableHead>
                  <TableHead className="w-[179px]">
                    <span className="font-normal text-gray-900">
                      Last Login
                    </span>
                  </TableHead>
                  <TableHead className="w-[258px]">
                    <span className="font-normal text-gray-900">
                      Critical Status
                    </span>
                  </TableHead>
                  <TableHead className="w-[207px]">
                    <span className="font-normal text-gray-900">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} className="h-[77px] border-t">
                    <TableCell className="w-16">
                      <Checkbox className="rounded-[1px] border-[0.5px] border-black" />
                    </TableCell>
                    <TableCell className="w-[371px]">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${client.avatar})` }}
                        />
                        <div>
                          <p className="font-medium text-gray-900 text-base">
                            {client.name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {client.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[199px] text-gray-700">
                      {client.lastWorkout}
                    </TableCell>
                    <TableCell className="w-[179px] text-gray-700">
                      {client.lastLogin}
                    </TableCell>
                    <TableCell className="w-[258px]">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={`bg-${client.criticalStatus.color}-100 text-${client.criticalStatus.color}-800 hover:bg-${client.criticalStatus.color}-100 rounded-full px-2.5 py-0.5`}
                        >
                          {client.criticalStatus.level}
                        </Badge>
                        <span className="text-green-600 text-xs font-medium cursor-pointer">
                          View Status
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-[207px]">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-8 rounded-lg"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-[30px] rounded-lg"
                        >
                          <PencilIcon className="h-4 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-[30px] rounded-lg"
                        >
                          <TrashIcon className="h-4 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
