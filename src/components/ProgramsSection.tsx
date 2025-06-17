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
import { createClient } from '@/utils/supabase/client';

type Program = {
  id: string;
  name: string;
  image?: string;
  difficulty: string;
  equipment: string;
  lastModified: string;
  is_active: boolean;
};

export const ProgramsSection = ({ programs }: { programs: Program[] }) => {
  const router = useRouter();
  const [localPrograms, setLocalPrograms] = React.useState(programs);
  const [activeTab, setActiveTab] = React.useState('active');

  React.useEffect(() => {
    setLocalPrograms(programs);
  }, [programs]);

  const handleRemove = async (programId: string) => {
    const supabase = createClient();
    await supabase.from('programs').update({ is_active: false }).eq('id', programId);
    setLocalPrograms((prev) => prev.map(p => p.id === programId ? { ...p, is_active: false } : p));
  };

  const handleRestore = async (programId: string) => {
    const supabase = createClient();
    await supabase.from('programs').update({ is_active: true }).eq('id', programId);
    setLocalPrograms((prev) => prev.map(p => p.id === programId ? { ...p, is_active: true } : p));
  };

  const handleDeleteForever = async (programId: string) => {
    const supabase = createClient();
    await supabase.from('programs').delete().eq('id', programId);
    setLocalPrograms((prev) => prev.filter(p => p.id !== programId));
  };

  // Filter by activeTab and is_active
  const filteredPrograms = localPrograms.filter(p =>
    activeTab === 'active' ? p.is_active !== false : p.is_active === false
  );

  const difficultyColorMap: Record<string, string> = {
    Beginner: 'green',
    Intermediate: 'yellow',
    Advanced: 'red',
  };

  const filterOptions = [
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
              value={activeTab}
              onValueChange={v => v && setActiveTab(v)}
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
                {filteredPrograms.map((program) => (
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
                        {activeTab === 'archived' ? (
                          <>
                            <Button variant="ghost" size="sm" className="text-green-600 p-0 h-auto flex items-center" onClick={() => handleRestore(program.id)}>
                              <span className="mr-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-green-600">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                              </span>
                              <span className="text-green-600 font-semibold">Restore</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-[#d10000] p-0 h-auto flex items-center" onClick={() => handleDeleteForever(program.id)}>
                              <span className="mr-1.5">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ff0000" className="w-5 h-5">
                                  <path d="M10 7H10.01M14 7H14.01M3 14L21 21M21 14L3 21M18 8.5C18 5.46243 15.3137 3 12 3C8.68629 3 6 5.46243 6 8.5C6 9.50179 8.48949 10.441 9 11.25C9.70984 12.3748 9 14 10 14C10 14 11.2987 14 12 14C12.7013 14 13.5 14 14 14C15 14 14.2902 12.3748 15 11.25C15.5105 10.441 18 9.50179 18 8.5Z" stroke="#d10000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                              </span>
                              <span className="text-[#d10000] font-semibold">Delete Forever</span>
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col space-y-1 items-start">
                              <Button variant="ghost" size="sm" className="text-green-600 p-0 h-auto flex items-center"
                                onClick={() => router.push(`/training-hub/program-editor/${program.id}`)}>
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
                              <Button variant="ghost" size="sm" className="text-red-600 p-0 h-auto flex items-center"
                                onClick={() => handleRemove(program.id)}>
                                <TrashIcon className="h-3.5 w-3 mr-1.5" />
                                Archive
                              </Button>
                            </div>
                          </>
                        )}
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
