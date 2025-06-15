'use client';

import {
  CopyIcon,
  ImageIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  ToggleGroup,
  ToggleGroupItem,
} from './ui/toggle-group';

type Program = {
  id: string;
  name: string;
  image?: string;
  difficulty: string;
  equipment: string;
  lastModified: string;
};

export const ProgramsSection = ({ programs }: { programs: Program[] }) => {
  const router = useRouter();

  const difficultyColorMap: Record<string, string> = {
    Beginner: 'green',
    Intermediate: 'yellow',
    Advanced: 'red',
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <section className="w-full flex justify-center py-8 px-5">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-7xl">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-3xl text-gray-900">Programs</h1>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={() => router.push('/training-hub/program-builder')}
            >
              <PlusIcon className="h-3.5 w-3.5 mr-2" />
              Add New Program
            </Button>
          </div>

          <div className="w-full max-w-[448px]">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input className="pl-10 h-[50px] bg-white" placeholder="Search programs" />
            </div>
          </div>

          <div className="w-fit">
            <ToggleGroup
              type="single"
              defaultValue="all"
              className="bg-gray-100 rounded-lg p-1"
            >
              {filterOptions.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="rounded-md h-9 px-4 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-green-700"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="border rounded-lg overflow-hidden shadow-[0px_1px_2px_#0000000d]">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[395px]">Program Name</TableHead>
                  <TableHead className="w-[146px]">Difficulty</TableHead>
                  <TableHead className="w-[291px]">Equipment Required</TableHead>
                  <TableHead className="w-[151px]">Last Modified</TableHead>
                  <TableHead className="w-[295px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id} className="bg-white">
                    <TableCell className="py-6">
                      <div className="flex items-center">
                        {program.image ? (
                          <div
                            className="w-16 h-16 rounded-lg bg-cover bg-center mr-5"
                            style={{ backgroundImage: `url(${program.image})` }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mr-5">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">
                          {program.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`bg-${difficultyColorMap[program.difficulty] ?? 'gray'}-100 text-${difficultyColorMap[program.difficulty] ?? 'gray'}-800 px-2 py-1 font-medium rounded-full`}
                      >
                        {program.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {program.equipment}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {program.lastModified}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <div className="flex flex-col space-y-1 items-start">
                          <Button variant="ghost" size="sm" className="text-green-600 p-0 h-auto flex items-center">
                            <PencilIcon className="h-3.5 w-3.5 mr-1.5" />
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-green-600 p-0 h-auto flex items-center">
                            <CopyIcon className="h-3.5 w-3.5 mr-1.5" />
                            Duplicate
                          </Button>
                        </div>
                        <div className="flex flex-col space-y-1 items-start">
                          <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-auto flex items-center">
                            <span className="mr-1.5">→</span>
                            Assign
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 p-0 h-auto flex items-center">
                            <TrashIcon className="h-3.5 w-3 mr-1.5" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
};
