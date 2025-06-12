'use client';
import {
  CopyIcon,
  ImageIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "./ui/toggle-group";

export const ProgramsSection: React.FC = () => {
  const router = useRouter();
  // Program data for mapping
  const programs = [
    {
      id: 1,
      name: "Strength Training for Beginners",
      image: "https://c.animaapp.com/mbqrzacsv2XpmH/img/img.png",
      difficulty: "Beginner",
      difficultyColor: "green",
      equipment: "Dumbbells, Resistance Bands",
      lastModified: "2024-01-15",
    },
    {
      id: 2,
      name: "Advanced HIIT Cardio",
      image: "https://c.animaapp.com/mbqrzacsv2XpmH/img/img-1.png",
      difficulty: "Advanced",
      difficultyColor: "red",
      equipment: "Kettlebells, Jump Rope",
      lastModified: "2024-01-12",
    },
    {
      id: 3,
      name: "Yoga Flow for Flexibility",
      image: "https://c.animaapp.com/mbqrzacsv2XpmH/img/img-2.png",
      difficulty: "Intermediate",
      difficultyColor: "yellow",
      equipment: "Yoga Mat, Blocks",
      lastModified: "2024-01-10",
    },
    {
      id: 4,
      name: "Bodyweight Boot Camp",
      image: null,
      difficulty: "Intermediate",
      difficultyColor: "yellow",
      equipment: "No Equipment",
      lastModified: "2024-01-08",
    },
  ];

  // Filter options
  const filterOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  return (
    <section className="w-full max-w-[1280px] mx-auto py-8 px-5">
      <div className="space-y-8">
        {/* Header with title and add button */}
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-3xl text-gray-900">Programs</h1>
          <Button
            className="bg-green-500 hover:bg-green-600"
            onClick={() => router.push("/training-hub/program-builder")}
          >
            <PlusIcon className="h-3.5 w-3.5 mr-2" />
            Add New Program
          </Button>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-[448px]">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-10 h-[50px] bg-white" placeholder="Search programs" />
          </div>
        </div>

        {/* Filter tabs */}
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
                className={
                  `rounded-md h-9 px-4 ${option.value === 'all' ? '' : 'text-gray-600'} ` +
                  'data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-green-700'
                }
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Programs table */}
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
                      className={`bg-${program.difficultyColor}-100 text-${program.difficultyColor}-800 hover:bg-${program.difficultyColor}-100 px-2 py-1 font-medium rounded-full`}
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
                      {/* First column: Edit (top), Duplicate (bottom) */}
                      <div className="flex flex-col space-y-1 items-start">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 p-0 h-auto flex items-center"
                        >
                          <PencilIcon className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 p-0 h-auto flex items-center"
                        >
                          <CopyIcon className="h-3.5 w-3.5 mr-1.5" />
                          Duplicate
                        </Button>
                      </div>
                      {/* Second column: Assign (top), Remove (bottom) */}
                      <div className="flex flex-col space-y-1 items-start">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 p-0 h-auto flex items-center"
                        >
                          <span className="mr-1.5">→</span>
                          Assign
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 p-0 h-auto flex items-center"
                        >
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
    </section>
  );
};
